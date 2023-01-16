const { Fellow } = require("./db");
module.exports = class Service {
  async getFellows() {
    return await Fellow.findAll();
  }
  async addFellow(fellow) {
    return await Fellow.create(fellow);
  }
};
