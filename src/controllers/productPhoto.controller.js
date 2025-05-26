const { ErrorHandler } = require("../util/error");
const {
  ProductPhotoModel,
  ProductModel,
  CoatingModel,
} = require("../models/index");
const { transformData } = require("../util/translate");
const {
  combineQuery,
  configureAttributesOption,
  processRecordUpdates,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new ProductPhoto
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    const { product_id, coating_id } = req.body;
    try {
      const doc = await ProductPhotoModel.findOne({
        where: { product_id, coating_id },
        attributes: ["id"],
      });
      if (doc) {
        await rollbackFileUploads(req.body);
        return res.status(400).json({
          message: "Unable to add new ProductPhoto",
          reason: "Record already defined",
        });
      }
      await ProductPhotoModel.create(req.body);
      return res
        .status(201)
        .json({ message: "ProductPhoto was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new ProductPhoto");
      return next(new ErrorHandler(400, "Failed to add new ProductPhoto", err));
    }
  },

  // Get all ProductPhotos
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query = combineQuery(req.query, query, [
        "product_id",
        "coating_id",
        "active",
      ]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
        include: [
          {
            model: ProductModel,
            as: "product",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
          {
            model: CoatingModel,
            as: "coating",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
        ],
      };

      const doc = await ProductPhotoModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll ProductPhotos");
      return next(
        new ErrorHandler(400, "Failed to findAll ProductPhotos", err)
      );
    }
  },

  // Get paginated ProductPhotos
  paginate: async (req, res, next) => {
    let { page, limit, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query = combineQuery(req.query, query, [
        "product_id",
        "coating_id",
        "active",
      ]);

      page = Number(page);
      limit = Number(limit);

      const size = page - 1;

      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
        include: [
          {
            model: ProductModel,
            as: "product",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
          {
            model: CoatingModel,
            as: "coating",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
        ],
      };

      const docs = await ProductPhotoModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate ProductPhotos");
      return next(
        new ErrorHandler(400, "Failed to paginate ProductPhotos", err)
      );
    }
  },

  // Get one ProductPhoto
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
        include: [
          {
            model: ProductModel,
            as: "product",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
          {
            model: CoatingModel,
            as: "coating",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
        ],
      };

      let doc = await ProductPhotoModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `ProductPhoto not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne ProductPhoto");
      return next(new ErrorHandler(400, "Failed to findOne ProductPhoto", err));
    }
  },

  // Update one ProductPhoto
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ProductPhotoModel.findByPk(id, {
        attributes: ["id", "photos"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `ProductPhoto not found, id: ${id}` });
      }

      const newUpdates = await processRecordUpdates(
        req,
        doc,
        ["photos"],
        "basket"
      );

      const [affectedRows] = await ProductPhotoModel.update(newUpdates, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "ProductPhoto was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update ProductPhoto");
      return next(new ErrorHandler(400, "Failed to update ProductPhoto", err));
    }
  },

  // Delete one ProductPhoto
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ProductPhotoModel.findByPk(id, {
        attributes: ["id", "photos"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `ProductPhoto not found, id: ${id}` });

      await removeFile(doc, ["photos"]);

      await ProductPhotoModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `ProductPhoto deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete ProductPhoto");
      return next(new ErrorHandler(400, "Failed to delete ProductPhoto", err));
    }
  },
};
