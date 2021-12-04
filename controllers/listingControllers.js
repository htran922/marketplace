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

    const key = datastore.key("Listings");
    const currentDateTime = new Date();
    const newListing = {
      key,
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
        const id = parseInt(key.id);
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

  /**
   * Delete a listing by id
   */
};

module.exports = listingControllers;
