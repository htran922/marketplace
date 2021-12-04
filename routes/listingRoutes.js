const express = require("express");
const router = express.Router();
const { checkJwt } = require("../lib/utils");
const listingControllers = require("../controllers/listingControllers");

router
  .route("/")
  .post(checkJwt.invalidToken, listingControllers.addListing)
  .get(checkJwt.invalidToken, listingControllers.getListings);

router
  .route("/:listing_id")
  .get(checkJwt.invalidToken, listingControllers.getListing)
  .put(checkJwt.invalidToken, listingControllers.editListing)
  .delete(checkJwt.invalidToken, listingControllers.deleteListing);

router
  .route("/:listing_id/categories/:category_id")
  .put(checkJwt.invalidToken, listingControllers.addCategoryToListing)
  .delete(checkJwt.invalidToken, listingControllers.removeCategoryFromListing);

module.exports = router;
