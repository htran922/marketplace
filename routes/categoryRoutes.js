const express = require("express");
const router = express.Router();
const categoryControllers = require("../controllers/categoryControllers");

router
  .route("/")
  .post(categoryControllers.addCategory)
  .get(categoryControllers.getCategories)
  .all((req, res) => {
    // Validate for invalid request methods at endpoint
    res.status(405).set("Allow", "GET, POST").json({
      Error: "Method not allowed at this endpoint",
    });
  });

router
  .route("/:category_id")
  .get(categoryControllers.getCategory)
  .put(categoryControllers.editCategory)
  .patch(categoryControllers.editCategory)
  .delete(categoryControllers.deleteCategory)
  .all((req, res) => {
    // Validate for invalid request methods at endpoint
    res.status(405).set("Allow", "GET, PUT, PATCH, DELETE").json({
      Error: "Method not allowed at this endpoint",
    });
  });

module.exports = router;
