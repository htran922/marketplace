const express = require("express");
const routes = require("./routes");
const { engine } = require("express-handlebars");

const app = express();
const PORT = process.env.PORT || 8080;

// view engine setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.enable("trust proxy");
app.set("trust proxy", true);

app.use(express.json()); // Enable parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
