const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// news > Yangiliklar
class NewsModel extends Model {}

const tableName = "news";
const modelName = "New";

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
    allowNull: false,
    validate: {
      isValidLanguageObject(value) {
        if (typeof value !== "object" || value === null) {
          throw new Error("Title must be an object with language keys.");
        }
      },
    },
  },
  content: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
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

NewsModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { NewsModel, schema, modelName, tableName };
