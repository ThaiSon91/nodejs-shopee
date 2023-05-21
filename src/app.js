const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

// console.log(`Process::`, process.env);

//init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//init db
require("./dbs/init.mongodb");

//dem so luong connect, co the bo trong init.mongodb.js
// const { countConnect } = require("./helpers/check.connect");
// countConnect();

//check over load
// const { checkOverload } = require("./helpers/check.connect");
// checkOverload();

//init routes
// app.get("/", (req, res, next) => {
//   // const strCompress = "Hello World, test compression";
//   return res.status(200).json({
//     message: "Welcome Backend Shopee",
//     // metadata: strCompress.repeat(8000),
//   });
// });

app.use("/", require("./routes"));

//handling error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
