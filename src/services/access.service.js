"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
// const crypto = require("crypto");
const crypto = require("node:crypto");

const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /*
    check token used ???
  */
  handlerRefreshToken = async (refreshToken) => {
    // check xem token nay da duoc su dung chua?
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    //neu co
    if (foundToken) {
      // decode xem la ai
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      // xoa tat ca cac token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happen !! Pls relogin");
    }

    //neu nhu chua co
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registered");

    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("[2]--", { userId, email });

    // check userId
    const foundShop = await findByEmail(email);
    if (!foundShop) throw new AuthFailureError("Shop not registered");

    // create 1 cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await holderToken.update({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        findByRefreshTokenUsed: refreshToken, // da duoc su dung de lay token moi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.debug(delKey);
    return delKey;
  };

  /*
    1- check email in dbs
    2- match password
    3- create AcceptToken & RefreshToken and save
    4- generate tokens
    5- get data return login
  */
  login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3.
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4.
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fileds: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // step1: check email exists??
    const holderShop = await shopModel.findOne({ email }).lean();
    //.lean() tra ve mot object thuan tuy, ko dung lean() lon hon toi 30 lan
    if (holderShop) {
      // return {
      //   code: "xxx",
      //   message: "Shop already registered",
      // };
      throw new BadRequestError("Error: Shop already registered");
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
      // Dung cho cac he thong lon nhu Amazon
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1", //pkcs8
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1", //pkcs8
      //     format: "pem",
      //   },
      // });

      // De don gian hon ko dung cryptogeneral nay
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      //Public Key CryptoGraphy Standards
      console.log({ privateKey, publicKey }); // save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: "xxx",
          message: "keyStore error",
        };
      }
      /*publicKey chuyen hashstring luu vao database, 
        RSA ko luu truc tiep vao mongodb->chuyen json string luu vao db
        khi lay ra tu mongodb chuyen ve publicKey*/

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
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error",
    //   };
    // }
  };
}

module.exports = new AccessService();
