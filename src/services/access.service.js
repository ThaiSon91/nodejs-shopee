"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step1: check email exists??
      const holderShop = await shopModel.findOne({ email }).lean();
      //.lean() tra ve mot object thuan tuy, ko dung lean() lon hon toi 30 lan
      if (holderShop) {
        return {
          code: "xxx",
          message: "Shop already registered",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      //do mat khau phuc tap hon 10, thuat toan bam anh huong cpu nen dung dat nhieu qua
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });
      // neu dang ky thanh cong cap cho refresh token va access token
      // su dung 2 cai token truy cap he thong tao san pham luon
      if (newShop) {
        // create privatekey: cho nguoi dung (ko luu trong he thong), publicKey: luu trong he thong
        // privatekey: sai cai token. publicKey: verify token
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
        });

        console.log({ privateKey, publicKey }); // save collection KeyStore

        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "publicKeyString error",
          };
        }

        // created token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        console.log(`Created Token Success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: newShop,
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
