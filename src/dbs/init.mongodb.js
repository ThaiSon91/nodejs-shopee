"use strict";

const mongoose = require("mongoose");

const connectString = `mongodb://127.0.0.1:27017/shopDEV`;

//lam quen singleton de khoi tao mot ket noi
//sau nay co them strategy pattern code tuyet dep
class Database {
  constructor() {
    this.connect();
  }

  //connect, sau nay can thi them loai connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString)
      .then((_) => console.log(`Connected Mongodb Sucess PRO`))
      .catch((err) => console.log(`Error Connect`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
