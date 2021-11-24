const express = require("express");
const routes = require("./routes");

const app = express();
app.enable("trust proxy");
app.set("trust proxy", true);
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Enable parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
