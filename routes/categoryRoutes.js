const express = require("express");
const router = express.Router();
const categoryControllers = require("../controllers/categoryControllers");

router.route("/").post(categoryControllers.addCategory);

module.exports = router;
