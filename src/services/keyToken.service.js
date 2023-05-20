"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      /*publicKey duoc sinh ra tu thuat toan bat doi xung
      chua dc hash nen chuyen ve toString() de luu vao database*/
      const publicKeyString = publicKey.toString();
      const tokens = await keytokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      });

      return tokens ? publicKeyString : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
