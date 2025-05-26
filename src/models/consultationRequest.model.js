const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db.config");

// consultation_requests > Konsultatsiya so'rovlari (Bepul konsultatsiya oling!)
class ConsultationRequestModel extends Model {}

const tableName = "consultation_requests";
const modelName = "ConsultationRequest";

const schema = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  }, // murojaat mazmuni
  date: {
    type: DataTypes.STRING,
    allowNull: true,
  }, // default: Date.now
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }, // murojaat ko'rildi yoki yo'qligi: 1 > yangi (ko'rilmadi), 2 > ko'rildi
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

ConsultationRequestModel.init(schema, {
  sequelize,
  modelName,
  tableName,
  timestamps: true,
  underscored: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  // freezeTableName: true,
});

module.exports = { ConsultationRequestModel, schema, modelName, tableName };
