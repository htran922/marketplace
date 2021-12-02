const express = require("express");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
const { engine } = require("express-handlebars");
const userInViews = require("./lib/middleware/userInViews");
const { SESSION_SECRET } = require("./constants");

const app = express();
const PORT = process.env.PORT || 8080;

const sessionConfig = {
  secret: SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

// view engine setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.enable("trust proxy");
app.set("trust proxy", true);

app.use(express.json()); // Enable parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(userInViews());

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
