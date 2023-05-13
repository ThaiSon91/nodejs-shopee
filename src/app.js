const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

//init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//init db
require("./dbs/init.mongodb");

//init routes
app.get("/", (req, res, next) => {
  // const strCompress = "Hello World, test compression";
  return res.status(200).json({
    message: "Welcome Backend Shopee",
    // metadata: strCompress.repeat(8000),
  });
});

//handling error

module.exports = app;