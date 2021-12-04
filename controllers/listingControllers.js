const ds = require("../datastore");
const datastore = ds.datastore;

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
          user_id: userId,
          created_at: currentDateTime,
          modified_at: currentDateTime,
          self,
        });
      }
    });
  },
};

module.exports = listingControllers;
