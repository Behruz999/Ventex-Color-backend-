const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// products > Mahsulotlar
class ProductModel extends Model {}

const tableName = "products";
const modelName = "Product";

const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  desc: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  }, // xususiyatlari
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
};

ProductModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { ProductModel, schema, modelName, tableName };
