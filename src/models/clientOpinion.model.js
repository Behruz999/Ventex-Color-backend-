const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// client_opinions > Mijozlar fikri (Bepul konsultatsiya oling!)
class ClientOpinionModel extends Model {}

const tableName = "client_opinions";
const modelName = "ClientOpinion";

const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  text: {
    type: DataTypes.JSON,
    allowNull: true,
  }, // fikr
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

ClientOpinionModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { ClientOpinionModel, schema, modelName, tableName };
