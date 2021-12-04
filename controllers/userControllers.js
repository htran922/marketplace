const ds = require("../datastore.js");
const datastore = ds.datastore;

const userControllers = {
  /**
   * Add a new user entity
   */
  addUser: async (req, res) => {
    const key = datastore.key("Users");
    const { userId, email } = req.body;
    const newUser = {
      key,
      data: {
        user_id: userId,
        email
      },
    };

    datastore.save(newUser, (err, apiResponse) => {
      if (err) {
        res.status(400);
      } else {
        const id = parseInt(key.id);
        const { protocol, originalUrl } = req;
        const self = `${protocol}://${req.get("host")}${originalUrl}/${id}`;
        res.status(201).json({
          user_id: userId,
          email,
          self,
        });
      }
    });
  },
  /**
   * Get all users registered in the application
   */
  getUsers: async (req, res) => {
    const query = datastore.createQuery("Users");
    const results = await datastore.runQuery(query);
    res.status(200).json(results[0]);
  },
};

module.exports = userControllers;
