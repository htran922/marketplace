const express = require("express");
const router = express.Router();
const { checkJwt } = require("../lib/utils");
const listingControllers = require("../controllers/listingControllers");

router
  .route("/")
  .post(checkJwt.invalidToken, listingControllers.addListing)
  .get(checkJwt.invalidToken, listingControllers.getListings);

// router
//   .route("/:listing_id")
//   .get(listingControllers.getListing)
//   .put(listingControllers.editListing)
//   .delete(listingControllers.deleteListing);

module.exports = router;
