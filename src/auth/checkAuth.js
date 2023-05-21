"use strict";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    // Check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({ message: "Forbidden Error" });
    }
    req.objKey = objKey;
    return next();
  } catch (error) {}
};

// Check permisson
const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Permission dinied",
      });
    }

    // Neu co permissions thi check tiep permissions do co hop le khong
    console.log("Permissions::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
};

module.exports = { apiKey, permission };
