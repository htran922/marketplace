const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes")
const categoryRoutes = require("./categoryRoutes");

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { title: "CS493 Portfolio - Marketplace" });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;