const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");

router
  .route("/")
  .get(userControllers.getUsers)
  .post(userControllers.addUser);

module.exports = router;
