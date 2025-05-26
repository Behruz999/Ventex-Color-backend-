require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: parseInt(process.env.MAX, 10) || 20,
      min: parseInt(process.env.MIN, 10) || 0,
      acquire: parseInt(process.env.ACQUIRE, 10) || 50000,
      idle: parseInt(process.env.IDLE, 10) || 30000,
    },
    logging: false,
    dialectOptions: {
      connectTimeout: 10000, // 10 soniya timeout
    },
  }
);

module.exports = sequelize;
