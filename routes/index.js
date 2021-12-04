const express = require("express");
const passport = require("passport");
require("../auth");
const router = express.Router();
const categoryRoutes = require("./categoryRoutes");
const userRoutes = require("./userRoutes");
const secured = require("../lib/middleware/secured")
const util = require("util");
const url = require("url");
const queryString = require("query-string")
const fetch = require("node-fetch-commonjs");
const _ = require('lodash'); 
const ds = require("../datastore");
const datastore = ds.datastore;
// const { isUserInDatastore } = require("../lib/utils")

const {
  AUTH0_DOMAIN_URL,
  AUTH0_CLIENT_ID,
  AUTH0_RETURN_URL
} = require("../constants");

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index", { title: "CS493 Portfolio - Marketplace" });
});

router.get(
  "/login",
  passport.authenticate("auth0", { scope: "openid email profile" })
);

router.get("/auth0/callback", function (req, res, next) {
  passport.authenticate("auth0", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || "/profile");
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
router.get("/logout", (req, res) => {
  req.logout();

  const logoutURL = new url.URL(
    util.format("https://%s/v2/logout", AUTH0_DOMAIN_URL)
  );
  var searchString = queryString.stringify({
    client_id: AUTH0_CLIENT_ID,
    returnTo: AUTH0_RETURN_URL,
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});

// Protected user route
router.get("/profile", secured(), async (req, res, next) => {
  const { _raw, _json, ...userInfo } = req.user;
  const token = userInfo.extraParams.id_token;

  const userId = userInfo.profile.id;
  const email = userInfo.profile["_json"].email;

  // Check if user exists in datastore
  const query = datastore.createQuery("Users").filter("user_id", "=", userId);
  const [ entities] = await datastore.runQuery(query)
  if (_.isEmpty(entities)) {
    // Make a fetch POST request to create user 
    const options = {
      userId,
      email
    }
   
    const jsonStringData = JSON.stringify(options);

    const response = await fetch("http://localhost:8080/users", {
      method: "POST",
      body: jsonStringData,
      headers: {
        "Content-Type": "application/json"
      }
    })

    await response.json();
  }

  res.render("profile", {
    token: token,
    userId: userInfo.extraParams.sub, 
    title: "User Profile",
  });
})

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
