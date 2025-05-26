const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// product_photos > Har bir qoplamaga tegishli mahsulot rasmlari (mavjud qoplama (rang) dagi mahsulot rasmlari)
class ProductPhotoModel extends Model {}

const tableName = "product_photos";
const modelName = "ProductPhoto";

const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coating_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

ProductPhotoModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
  indexes: [{ fields: ["product_id"] }, { fields: ["coating_id"] }],
});

module.exports = { ProductPhotoModel, schema, modelName, tableName };
