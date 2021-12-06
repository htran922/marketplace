const ds = require("../datastore");
const datastore = ds.datastore;
const _ = require("lodash");

const listingControllers = {
  /**
   * Add a new listing entity
   */
  addListing: async (req, res) => {
    const { name, description, condition, price } = req.body;
    if (!name || !description || !condition || !price) {
      res.status(400).json({
        Error:
          "The request object is missing at least one of the required attributes",
      });
    }

    const listingKey = datastore.key("Listings");
    const currentDateTime = new Date();
    const newListing = {
      key: listingKey,
      data: {
        name,
        description,
        condition,
        price,
        category: null,
        user_id: req.user.sub,
        created_at: currentDateTime,
        modified_at: currentDateTime,
      },
    };

    datastore.save(newListing, (err, apiResponse) => {
      if (err) {
        res.status(400);
      } else {
        const id = parseInt(listingKey.id);
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}/${id}`;
        res.status(201).json({
          id,
          name,
          description,
          condition,
          price,
          category: null,
          user_id: req.user.sub,
          created_at: currentDateTime,
          modified_at: currentDateTime,
          self,
        });
      }
    });
  },

  /**
   * View a single listing entity by id
   */
  getListing: async (req, res) => {
    const listingId = parseInt(req.params.listing_id, 10);
    const key = datastore.key(["Listings", listingId]);

    const [entity] = await datastore.get(key);

    if (entity) {
      if (entity["user_id"] !== req.user.sub) {
        res.status(403).json({
          Error: "Cannot view listing created by another user",
        });
        return;
      }

      const {
        name,
        description,
        condition,
        price,
        category,
        user_id,
        created_at,
        modified_at,
      } = entity;

      const { protocol, originalUrl } = req;

      const self = `${protocol}://${req.get("host")}${originalUrl}`;

      if (category != null) {
        const id = category.id;
        const self = `${protocol}://${req.get("host")}/categories/${id}`;
        category["self"] = self;
      }

      res.status(200).json({
        id: listingId,
        name,
        description,
        condition,
        price,
        category,
        user_id,
        created_at,
        modified_at,
        self,
      });
    }
  },

  /**
   * Get all listings with pagination for logged in user
   */
  getListings: async (req, res) => {
    const generalQuery = datastore
      .createQuery("Listings")
      .filter("user_id", "=", req.user.sub);
    let paginatedQuery = datastore
      .createQuery("Listings")
      .filter("user_id", "=", req.user.sub)
      .limit(5);
    let response = {};

    const { protocol, baseUrl } = req;

    // If req params contains "cursor" then start query from this id
    if (Object.keys(req.query).includes("cursor")) {
      paginatedQuery = paginatedQuery.start(req.query.cursor);
    }

    // Set the item count in response
    const results = await datastore.runQuery(generalQuery);
    response["total_count"] = results[0].length;

    const paginatedResults = await datastore.runQuery(paginatedQuery);
    const entities = paginatedResults[0];
    const info = paginatedResults[1];

    // Map the entities to an items property in the response
    response.items = entities.map(ds.fromDatastore);

    response.items.forEach((entity) => {
      // Add self link to each category
      const self = `${protocol}://${req.get("host")}/listings/${entity.id}`;
      entity["self"] = self;

      // Add self link to associated category
      if (!_.isEmpty(entity.category)) {
        const url = `${protocol}://${req.get("host")}/categories/${
          entity.category.id
        }`;
        entity.category["self"] = url;
      }
    });

    if (info.moreResults !== ds.Datastore.NO_MORE_RESULTS) {
      // If there are more results to retrieve return the url for next page
      response.next = `${protocol}://${req.get(
        "host"
      )}${baseUrl}?cursor=${encodeURIComponent(info.endCursor)}`;
    }

    res.status(200).json(response);
  },

  /**
   * Edit a listing by id
   */
  editListing: async (req, res) => {
    // Check if request header is JSON
    if (!req.is("application/json")) {
      res.status(415).json({
        Error: "Server only accepts application/json data",
      });
      return;
    }

    const { name, description, condition, price } = req.body;
    if (
      req.method === "PUT" &&
      (!name || !description || !condition || !price)
    ) {
      res.status(400).json({
        Error:
          "The request object is missing at least one of the required attributes",
      });
      return;
    }

    const listingId = parseInt(req.params.listing_id, 10);
    const key = datastore.key(["Listings", listingId]);

    // Get existing entity
    const [entity] = await datastore.get(key);

    if (!entity) {
      res.status(404).json({
        Error: "No listing with this listing_id exists",
      });
      return;
    }

    if (entity["user_id"] !== req.user.sub) {
      res.status(403).json({
        Error: "Cannot edit listing created by another user",
      });
      return;
    }

    // Build data object with new modified_at property
    let data = {
      name: entity["name"],
      description: entity["description"],
      condition: entity["condition"],
      price: entity["price"],
      created_at: entity["created_at"],
      modified_at: new Date(),
      user_id: entity["user_id"],
      category: entity["category"],
    };

    // Replace data object with any properties from request body
    for (let property in req.body) {
      data[property] = req.body[property];
    }

    const updatedListing = {
      key,
      data,
    };

    datastore.save(updatedListing, (err, apiResponse) => {
      if (!err) {
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}`;

        if (data["category"] != null) {
          const id = data["category"]["id"];
          const self = `${protocol}://${req.get("host")}/categories/${id}`;
          data["category"]["self"] = self;
        }

        const returnJson = {
          id: listingId,
          name: data["name"],
          description: data["description"],
          condition: data["condition"],
          price: data["price"],
          created_at: data["created_at"],
          modified_at: data["modified_at"],
          user_id: data["user_id"],
          category: data["category"],
          self,
        };

        if (req.method === "PUT") {
          res.status(303).set("Location", self).json(returnJson);
        } else {
          res.status(200).json(returnJson);
        }
      }
    });
  },

  /**
   * Delete a listing by id
   */
  deleteListing: async (req, res) => {
    const listingId = parseInt(req.params.listing_id, 10);
    const listingKey = datastore.key(["Listings", listingId]);

    const [listingEntity] = await datastore.get(listingKey);

    if (listingEntity) {
      if (listingEntity["user_id"] !== req.user.sub) {
        res.status(403).json({
          Error: "Cannot delete listing created by another user",
        });
        return;
      }

      // Account for scenario of no category assigned to listing
      if (listingEntity.category != null) {
        // Check for any category entities with this listing id and remove it
        const categoryKey = datastore.key([
          "Categories",
          listingEntity.category.id,
        ]);
        const [categoryEntity] = await datastore.get(categoryKey);
        categoryEntity.listings = categoryEntity.listings.filter((listing) => {
          listing.id === listingId;
        });
        try {
          await datastore.save({
            key: categoryKey,
            data: categoryEntity,
          });
        } catch (err) {
          throw err;
        }
      }

      await datastore.delete(listingKey);
      res.status(204).json();
    } else {
      res.status(404).json({
        Error: "No listing with this listing_id exists",
      });
    }
  },

  /**
   * Assign category to listing
   * Update Listing and Category entities to reflect update
   */
  addCategoryToListing: async (req, res) => {
    const listingId = parseInt(req.params.listing_id, 10);
    const categoryId = parseInt(req.params.category_id, 10);

    const listingKey = datastore.key(["Listings", listingId]);
    const categoryKey = datastore.key(["Categories", categoryId]);

    const [listingEntity] = await datastore.get(listingKey);
    const [categoryEntity] = await datastore.get(categoryKey);

    if (listingEntity && categoryEntity) {
      // Check if category is null for the listing
      if (listingEntity.category === null) {
        listingEntity.category = {
          id: categoryId,
          name: categoryEntity.name,
        };

        categoryEntity.listings.push({
          id: listingId,
        });

        try {
          await datastore.save({
            key: listingKey,
            data: listingEntity,
          });

          await datastore.save({
            key: categoryKey,
            data: categoryEntity,
          });
        } catch (err) {
          throw err;
        }

        // Successfully updated boat listing and category entities
        res.status(204).json();
      } else {
        res.status(403).json({
          Error: "The listing already has a category",
        });
      }
    } else {
      res.status(404).json({
        Error: "The specified listing and/or category does not exist",
      });
    }
  },

  /**
   * Remove category from listing
   */
  removeCategoryFromListing: async (req, res) => {
    const listingId = parseInt(req.params.listing_id, 10);
    const categoryId = parseInt(req.params.category_id, 10);

    const listingKey = datastore.key(["Listings", listingId]);
    const categoryKey = datastore.key(["Categories", categoryId]);

    const [listingEntity] = await datastore.get(listingKey);
    const [categoryEntity] = await datastore.get(categoryKey);

    if (listingEntity && categoryEntity) {
      // Check if category is assigned to listing
      if (
        listingEntity.category != null &&
        _.find(categoryEntity.listings, { id: listingId })
      ) {
        // Remove listing id from listings array in category entity
        categoryEntity.listings = categoryEntity.listings.filter((listing) => {
          listing.id === listingId;
        });

        // Set category in listing entity to null
        listingEntity.category = null;

        try {
          await datastore.save({
            key: listingKey,
            data: listingEntity,
          });

          await datastore.save({
            key: categoryKey,
            data: categoryEntity,
          });
        } catch (err) {
          throw err;
        }

        // Successfully updated boat listing and category entities
        res.status(204).json();
      } else {
        res.status(403).json({
          Error:
            "No listing with this listing_id has a category with this category_id",
        });
      }
    } else {
      res.status(404).json({
        Error: "The specified listing and/or category does not exist",
      });
    }
  },
};

module.exports = listingControllers;
