const { ErrorHandler } = require("../util/error");
const { ProductCategoryModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new ProductCategory
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await ProductCategoryModel.create(req.body);
      return res
        .status(201)
        .json({ message: "ProductCategory was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new ProductCategory");
      return next(
        new ErrorHandler(400, "Failed to add new ProductCategory", err)
      );
    }
  },

  // Get all ProductCategories
  findAll: async (req, res, next) => {
    const { search, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await ProductCategoryModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll ProductCategories");
      return next(
        new ErrorHandler(400, "Failed to findAll ProductCategories", err)
      );
    }
  },

  // Get paginated ProductCategories
  paginate: async (req, res, next) => {
    let { page, limit, search, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      query = combineQuery(req.query, query, ["active"]);

      page = Number(page);
      limit = Number(limit);

      const size = page - 1;

      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
      };

      const docs = await ProductCategoryModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate ProductCategories");
      return next(
        new ErrorHandler(400, "Failed to paginate ProductCategories", err)
      );
    }
  },

  // Get one ProductCategory
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await ProductCategoryModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `ProductCategory not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne ProductCategory");
      return next(
        new ErrorHandler(400, "Failed to findOne ProductCategory", err)
      );
    }
  },

  // Update one ProductCategory
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ProductCategoryModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `ProductCategory not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await ProductCategoryModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "ProductCategory was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update ProductCategory");
      return next(
        new ErrorHandler(400, "Failed to update ProductCategory", err)
      );
    }
  },

  // Delete one ProductCategory
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ProductCategoryModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `ProductCategory not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await ProductCategoryModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `ProductCategory deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete ProductCategory");
      return next(
        new ErrorHandler(400, "Failed to delete ProductCategory", err)
      );
    }
  },
};
