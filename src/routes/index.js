"use strict";

const express = require("express");
const { apiKey } = require("../auth/checkAuth");
const router = express.Router();

// Check API Key
router.use(apiKey);
// Check permission

router.use("/v1/api", require("./access"));

// router.get("", (req, res, next) => {
//   return res.status(200).json({
//     message: "Welcome Backend Shopee",
//   });
// });

module.exports = router;
