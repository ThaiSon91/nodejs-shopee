"use strict";

//!dmbg
const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the mongo model
const keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    // de test hacker su dung cac token nay
    refreshToken: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);
