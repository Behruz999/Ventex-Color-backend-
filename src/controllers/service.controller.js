const { ErrorHandler } = require("../util/error");
const { ServiceModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new Service
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await ServiceModel.create(req.body);
      return res
        .status(201)
        .json({ message: "Service was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new Service");
      return next(new ErrorHandler(400, "Failed to add new Service", err));
    }
  },

  // Get all Services
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

      const doc = await ServiceModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Service");
      return next(new ErrorHandler(400, "Failed to findAll Service", err));
    }
  },

  // Get paginated Services
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

      const docs = await ServiceModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Service");
      return next(new ErrorHandler(400, "Failed to paginate Service", err));
    }
  },

  // Get one Service
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await ServiceModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `Service not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Service");
      return next(new ErrorHandler(400, "Failed to findOne Service", err));
    }
  },

  // Update one Service
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ServiceModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `Service not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await ServiceModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "Service was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update Service");
      return next(new ErrorHandler(400, "Failed to update Service", err));
    }
  },

  // Delete one Service
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ServiceModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `Service not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await ServiceModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `Service deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete Service");
      return next(new ErrorHandler(400, "Failed to delete Service", err));
    }
  },
};
