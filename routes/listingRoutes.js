const express = require("express");
const router = express.Router();
const listingControllers = require("../controllers/listingControllers");

router
  .route("/")
  .post(listingControllers.addListing)
  // .get(listingControllers.getListings);

// router
//   .route("/:listing_id")
//   .get(listingControllers.getListing)
//   .put(listingControllers.editListing)
//   .delete(listingControllers.deleteListing);

module.exports = router;
