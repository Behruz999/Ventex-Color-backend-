const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// contacts > Bog'lanish
class ContactModel extends Model {}

const tableName = "contacts";
const modelName = "Contact";

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
  phones: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  brand_title: {
    type: DataTypes.JSON,
    allowNull: true,
  }, // sayt nomi: Ventex Color
  logo: {
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

ContactModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { ContactModel, schema, modelName, tableName };
