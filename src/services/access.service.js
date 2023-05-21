"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

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
          publicKeyEncoding: {
            type: "pkcs1", //pkcs8
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1", //pkcs8
            format: "pem",
          },
        });
        //Public Key CryptoGraphy Standards
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
        /*publicKey chuyen hashstring luu vao database, 
        RSA ko luu truc tiep vao mongodb->chuyen json string luu vao db
        khi lay ra tu mongodb chuyen ve publicKey*/

        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        console.log(`publicKeyObject::`, publicKeyObject);

        // created token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyObject,
          privateKey
        );
        console.log(`Created Token Success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fileds: ["_id", "name", "email"],
              object: newShop,
            }),
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
