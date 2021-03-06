const ds = require("../datastore.js");
const datastore = ds.datastore;
const _ = require("lodash");

const categoryControllers = {
  /**
   * Add a new category entity
   */
  addCategory: (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({
        Error:
          "The request object is missing at least one of the required attributes",
      });
      return;
    }

    const key = datastore.key("Categories");
    const currentDateTime = new Date();
    const listings = []; // A new category should start off with no listings
    const newCategory = {
      key: key,
      data: {
        name,
        description,
        created_at: currentDateTime,
        modified_at: currentDateTime,
        listings,
      },
    };

    datastore.save(newCategory, (err, apiResponse) => {
      if (err) {
        res.status(400);
      } else {
        const id = parseInt(key.id);
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}/${id}`;
        res.status(201).json({
          id,
          name,
          description,
          created_at: currentDateTime,
          modified_at: currentDateTime,
          listings,
          self,
        });
      }
    });
  },

  /*
   * View a single category entity by id
   */
  getCategory: async (req, res) => {
    const categoryId = parseInt(req.params.category_id, 10);
    const key = datastore.key(["Categories", categoryId]);

    const [entity] = await datastore.get(key);

    if (entity) {
      const { name, description, created_at, modified_at, listings } = entity;
      const { protocol, originalUrl } = req;

      const self = `${protocol}://${req.get("host")}${originalUrl}`;

      if (listings.length > 0) {
        listings.forEach((listing) => {
          const url = `${protocol}://${req.get("host")}/listings/${listing.id}`;
          listing["self"] = url;
        });
      }

      if (req.accepts("application/json")) {
        res.status(200).json({
          id: categoryId,
          name,
          description,
          created_at,
          modified_at,
          listings,
          self,
        });
      } else {
        res.status(406).json({
          Error: "The request MIME type is not supported at this endpoint",
        });
      }
    } else {
      res.status(404).json({
        Error: "No category with this category_id exists",
      });
    }
  },

  /*
   * Get all category entities with pagination
   */
  getCategories: async (req, res) => {
    const generalQuery = datastore.createQuery("Categories");
    let paginatedQuery = datastore.createQuery("Categories").limit(5);
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
      const self = `${protocol}://${req.get("host")}/categories/${entity.id}`;
      entity["self"] = self;

      // Add self link to associated listings
      if (entity.listings.length > 0) {
        entity.listings.forEach((listing) => {
          const url = `${protocol}://${req.get("host")}/listings/${listing.id}`;
          listing["self"] = url;
        });
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
   * Edit a category by id
   */
  editCategory: async (req, res) => {
    if (!req.is("application/json")) {
      res.status(415).json({
        Error: "Server only accepts application/json data",
      });
      return;
    }

    // Validate for missing attribute if request method is PUT
    if (req.method === "PUT" && (!req.body.name || !req.body.description)) {
      res.status(400).json({
        Error:
          "The request object is missing at least one of the required attributes",
      });
      return;
    }

    const id = parseInt(req.params.category_id, 10);
    const key = datastore.key(["Categories", id]);

    // Get existing entity
    const [entity] = await datastore.get(key);

    if (!entity) {
      res.status(404).json({
        Error: "No category with this category_id exists",
      });
      return;
    }

    // Build data object with new modified_at property
    let data = {
      name: entity["name"],
      description: entity["description"],
      listings: entity["listings"],
      created_at: entity["created_at"],
      modified_at: new Date(),
    };

    // Replace data object with any properties from request body
    for (let property in req.body) {
      data[property] = req.body[property];
    }

    const updatedCategory = {
      key,
      data,
    };

    datastore.save(updatedCategory, (err, apiResponse) => {
      if (!err) {
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}`;

        // Add self link to associated listings
        if (data["listings"].length > 0) {
          data["listings"].forEach((listing) => {
            const id = listing.id;
            const self = `${protocol}://${req.get("host")}/listings/${id}`;
            listing["self"] = self;
          });
        }

        const returnJson = {
          id,
          name: data["name"],
          description: data["description"],
          created_at: data["created_at"],
          modified_at: data["modified_at"],
          listings: data["listings"],
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
   * Delete a category by id
   */
  deleteCategory: async (req, res) => {
    const categoryId = parseInt(req.params.category_id, 10);
    const categoryKey = datastore.key(["Categories", categoryId]);

    const [categoryEntity] = await datastore.get(categoryKey);
    if (categoryEntity) {
      // Find the listing entity with that id and set category to null
      if (!_.isEmpty(categoryEntity.listings)) {
        const query = datastore
          .createQuery("Listings")
          .filter("category.id", "=", categoryId);
        const [listingEntities] = await datastore.runQuery(query);
        if (listingEntities.length > 0) {
          listingEntities.forEach((listing) => {
            listing.category = null;
          });
        }
        try {
          await datastore.save(listingEntities);
        } catch (err) {
          throw err;
        }
      }

      datastore.delete(categoryKey, (err, apiResponse) => {
        res.status(204).json();
      });
    } else {
      res.status(404).json({
        Error: "No category with this category_id exists",
      });
    }
  },
};

module.exports = categoryControllers;
