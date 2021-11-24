const ds = require("../datastore.js");
const datastore = ds.datastore;

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
    }

    const key = datastore.key("Categories");
    const currentDateTime = new Date();
    const newCategory = {
      key: key,
      data: {
        name,
        description,
        created_at: currentDateTime,
        modified_at: currentDateTime,
      },
    };

    datastore.save(newCategory, (err, apiResponse) => {
      if (err) {
        res.status(400);
      } else {
        const id = key.id;
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}/${id}`;
        res.status(201).json({
          id,
          name,
          description,
          created_at: currentDateTime,
          modified_at: currentDateTime,
          self,
        });
      }
    });
  },
};

module.exports = categoryControllers;