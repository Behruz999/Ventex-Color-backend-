const sequelize = require("../config/db.config");
const { AboutModel } = require("./about.model");
const { ClientOpinionModel } = require("./clientOpinion.model");
const { CoatingModel } = require("./coating.model");
const { ConsultationRequestModel } = require("./consultationRequest.model");
const { ContactModel } = require("./contact.model");
const { FileMetadataModel } = require("./fileMetadata.model");
const { NewsModel } = require("./news.model");
const { OurPartnerModel } = require("./ourPartner.model");
// const { PhotoMediaModel } = require("./photoMedia.model");
const { ProductModel } = require("./product.model");
const { ProductCategoryModel } = require("./productCategory.model");
const { ProductPhotoModel } = require("./productPhoto.model");
const { ServiceModel } = require("./service.model");
const { SliderModel } = require("./slider.model");
const { SocialNetworkModel } = require("./socialNetwork.model");
const { UserModel } = require("./user.model");
// const { VideoMediaModel } = require("./videoMedia.model");

// Define associations
const setupAssociations = () => {
  ProductModel.belongsTo(ProductCategoryModel, {
    foreignKey: "category_id",
    as: "category",
  });
  // ProductModel.belongsTo(ProductPhotoModel, {
  //   foreignKey: "product_id",
  //   as: "product_photos",
  // });
  ProductPhotoModel.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product",
  });
  ProductPhotoModel.belongsTo(CoatingModel, {
    foreignKey: "coating_id",
    as: "coating",
  });

  ProductCategoryModel.hasMany(ProductModel, {
    foreignKey: "category_id",
    as: "products",
  });
  ProductModel.hasMany(ProductPhotoModel, {
    foreignKey: "product_id",
    as: "product_photos",
  });
};

const syncModels = async () => {
  try {
    setupAssociations(); // Ensure associations are set up before syncing
    await sequelize.sync({ alter: true }); // Use { force: true } if you want to drop and recreate tables
    console.log("All models were synchronized successfully!");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
};

module.exports = {
  AboutModel,
  ClientOpinionModel,
  CoatingModel,
  ConsultationRequestModel,
  ContactModel,
  FileMetadataModel,
  NewsModel,
  OurPartnerModel,
  // PhotoMediaModel,
  ProductModel,
  ProductCategoryModel,
  ProductPhotoModel,
  ServiceModel,
  SliderModel,
  SocialNetworkModel,
  UserModel,
  // VideoMediaModel,
  syncModels,
};
