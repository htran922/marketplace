const express = require("express");
const router = express.Router();
const categoryControllers = require("../controllers/categoryControllers");

router
  .route("/")
  .post(categoryControllers.addCategory)
  .get(categoryControllers.getCategories);

router
  .route("/:category_id")
  .get(categoryControllers.getCategory)
  .put(categoryControllers.editCategory)
  .patch(categoryControllers.editCategory)
  .delete(categoryControllers.deleteCategory);

module.exports = router;
