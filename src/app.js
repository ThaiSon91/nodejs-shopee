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

module.exports = app;
