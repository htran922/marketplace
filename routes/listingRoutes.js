const express = require("express");
const router = express.Router();
const { checkJwt } = require("../lib/utils");
const listingControllers = require("../controllers/listingControllers");

router
  .route("/")
  .post(checkJwt.invalidToken, listingControllers.addListing)
  .get(checkJwt.invalidToken, listingControllers.getListings)
  .all((req, res) => {
    // Validate for invalid request methods at endpoint
    res.status(405).set("Allow", "GET, POST").json({
      Error: "Method not allowed at this endpoint",
    });
  });

router
  .route("/:listing_id")
  .get(checkJwt.invalidToken, listingControllers.getListing)
  .put(checkJwt.invalidToken, listingControllers.editListing)
  .patch(checkJwt.invalidToken, listingControllers.editListing)
  .delete(checkJwt.invalidToken, listingControllers.deleteListing)
  .all((req, res) => {
    // Validate for invalid request methods at endpoint
    res.status(405).set("Allow", "GET, PUT, PATCH, DELETE").json({
      Error: "Method not allowed at this endpoint",
    });
  });

router
  .route("/:listing_id/categories/:category_id")
  .put(checkJwt.invalidToken, listingControllers.addCategoryToListing)
  .delete(checkJwt.invalidToken, listingControllers.removeCategoryFromListing)
  .all((req, res) => {
    // Validate for invalid request methods at endpoint
    res.status(405).set("Allow", "PUT, DELETE").json({
      Error: "Method not allowed at this endpoint",
    });
  });

module.exports = router;
