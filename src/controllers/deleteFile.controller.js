const { deleteFile } = require("../util/deleteFile");
const { safeParse } = require("../util/translate");
const { ErrorHandler } = require("../util/error");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const {
  AboutModel,
  ClientOpinionModel,
  CoatingModel,
  ContactModel,
  FileMetadataModel,
  NewsModel,
  OurPartnerModel,
  // PhotoMediaModel,
  ProductCategoryModel,
  ProductPhotoModel,
  ServiceModel,
  SliderModel,
} = require("../models/index");

const modelMapping = {
  abouts: {
    model: AboutModel,
    fields: ["photo"], // fayl/rasm ni o'zida saqlaydigan column lar
  },
  "client-opinions": {
    model: ClientOpinionModel,
    fields: ["photo"],
  },
  coatings: {
    model: CoatingModel,
    fields: ["photo"],
  },
  contacts: {
    model: ContactModel,
    fields: ["photo", "logo"],
  },
  "file-metadatas": {
    model: FileMetadataModel,
    fields: ["path"],
  },
  news: {
    model: NewsModel,
    fields: ["photos"],
  },
  "our-partners": {
    model: OurPartnerModel,
    fields: ["photo"],
  },
  // "photo-medias": {
  //   model: PhotoMediaModel,
  //   fields: ["photo"],
  // },
  "product-categories": {
    model: ProductCategoryModel,
    fields: ["photo"],
  },
  "product-photos": {
    model: ProductPhotoModel,
    fields: ["photos"],
  },
  services: {
    model: ServiceModel,
    fields: ["photo"],
  },
  sliders: {
    model: SliderModel,
    fields: ["photo"],
  },
}; // fayl, rasmlari bor table larni ro'yxati

module.exports = {
  // Fayl (rasm)ni o'chirish uchun api
  deleteFile: async function (req, res, next) {
    const { filePath } = req.query; // foydalanuvchi o'chirmoqchi bo'lgan fayl (rasm) ning url
    try {
      // const baseUrl = new URL(filePath).pathname.split("/").slice(-3)[0]; // oxirgi 3 ta url parchaning 1-chisini olish, table ni (obj dan) aniqlashda kerak bo'ladi
      const baseUrl = filePath.split("/")[0];

      const modelConfig = modelMapping[baseUrl]; // modelni aniqlash, misol: contacts > Contact

      if (!modelConfig) {
        console.error(`No model configuration found for baseUrl: "${baseUrl}"`);
        return res.status(400).json({
          message: `No model configuration found for baseUrl: "${baseUrl}"`,
        });
      }

      const { model, fields } = modelConfig;
      // model > tanlangan model
      // fields > o'chirilishi yoki yangilanishi kerak bo'lgan fayl yoki rasm url larini o'zida saqlovchi column lar
      const conditions = fields.map((field) => ({
        [Op.or]: [
          { [field]: filePath }, // qiymati oddiy string bo'lgan column bo'yicha filter
          Sequelize.where(
            Sequelize.fn(
              "JSON_CONTAINS",
              Sequelize.col(field),
              JSON.stringify(filePath)
            ),
            true
          ), // qiymati array-string bo'lgan column ichidan rasm/fayl url sini topish
        ],
      }));

      const record = await model.findOne({
        where: {
          [Op.or]: conditions,
        },
      }); // fayl yoki rasmning url sini o'z ichiga olgan dokumentni topish

      // agar rasm (yoki fayl)ning url bor dokument topilmasa, faylni o'chirib, klientga muvofiq javob qaytarish
      if (!record) {
        console.log(`No matching record found in model "${baseUrl}"`);
        return res.status(400).json({
          message: `No matching record found, filePath: ${filePath}`,
        });
      }

      const fieldToUpdate = fields.find((field) => {
        const value = safeParse(record[field]);
        if (Array.isArray(value)) {
          return value.includes(filePath); // array turiga ta'luqli qiymatni aniqlash va borligini tekshirish
        }
        return value === filePath; // string turiga ta'luqli qiymatni aniqlash
      }); // yangilanishi kerak bo'lgan column ni aniqlash

      if (!fieldToUpdate) {
        console.error("Field not found in the record!");
        return res
          .status(400)
          .json({ message: `Field not found in the record` });
      }

      filePath && (await deleteFile(filePath)); // faylni (yoki rasmni) o'chirish

      if (Array.isArray(safeParse(record[fieldToUpdate]))) {
        // array holatini hal qilish: dokumentni array column dan fayl url lini olib tashlash va yangilangan holatini bazaga saqlash
        const updatedArray = safeParse(record[fieldToUpdate]).filter(
          (url) => url !== filePath
        ); // array ni filterlash: fayl yoki rasm ni url ni olib tashlash

        await record.update({ [fieldToUpdate]: updatedArray }); // bazaga array column ni yangilangan holatini saqlash
      } else {
        // array bo'lmagan column lar uchun dokumentni yangilash holati, NULL qiymat beriladi
        await record.update({ [fieldToUpdate]: null });
      }

      return res.status(200).json({
        message: `The requested photo/file has been deleted, filePath: ${filePath}`,
      });
    } catch (err) {
      // console.log(err, '- err')
      return next(new ErrorHandler(400, "Failed to delete Files", err));
    }
  },
};
