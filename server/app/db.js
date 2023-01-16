const Sequelize = require("sequelize");
const fellowModel = require("./models/fellow");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
    define: {
      timestamps: true,
    },
  }
);
const Fellow = sequelize.define("fellow", fellowModel);
Fellow.hasMany(Fellow, { as: "subordinates", foreignKey: "chief" });
Fellow.belongsTo(Fellow, { as: "chief_", foreignKey: "chief" });
module.exports = {sequelize, Fellow}