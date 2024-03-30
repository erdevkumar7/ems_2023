const Sequelize = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DATABASE,
  "root",
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully ... ");
  })
  .catch((err) => {
    console.log("Database connection faild", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, Sequelize);
db.Email = require("./email.model")(sequelize, Sequelize);

//export deb
module.exports = db;
