const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// abouts > Kutubxona haqida
class AboutModel extends Model {}

const tableName = "abouts";
const modelName = "About";

const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
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

AboutModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { AboutModel, schema, modelName, tableName };
