const express = require("express");
const router = express.Router();
const categoryControllers = require("../controllers/categoryControllers");

router
  .route("/")
  .post(categoryControllers.addCategory)
  .get(categoryControllers.getCategories);

module.exports = router;
