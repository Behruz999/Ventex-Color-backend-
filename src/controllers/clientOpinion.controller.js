const { ErrorHandler } = require("../util/error");
const { ClientOpinionModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new ClientOpinion
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await ClientOpinionModel.create(req.body);
      return res
        .status(201)
        .json({ message: "ClientOpinion was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new ClientOpinion");
      return next(
        new ErrorHandler(400, "Failed to add new ClientOpinion", err)
      );
    }
  },

  // Get all ClientOpinions
  findAll: async (req, res, next) => {
    const { full_name, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (full_name) {
        query = searchBy(query, full_name, "full_name", lang);
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await ClientOpinionModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll ClientOpinion");
      return next(
        new ErrorHandler(400, "Failed to findAll ClientOpinion", err)
      );
    }
  },

  // Get paginated ClientOpinions
  paginate: async (req, res, next) => {
    let { page, limit, full_name, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (full_name) {
        query = searchBy(query, full_name, "full_name", lang);
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

      const docs = await ClientOpinionModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate ClientOpinion");
      return next(
        new ErrorHandler(400, "Failed to paginate ClientOpinion", err)
      );
    }
  },

  // Get one ClientOpinion
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await ClientOpinionModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `ClientOpinion not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne ClientOpinion");
      return next(
        new ErrorHandler(400, "Failed to findOne ClientOpinion", err)
      );
    }
  },

  // Update one ClientOpinion
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ClientOpinionModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `ClientOpinion not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await ClientOpinionModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "ClientOpinion was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update ClientOpinion");
      return next(new ErrorHandler(400, "Failed to update ClientOpinion", err));
    }
  },

  // Delete one ClientOpinion
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ClientOpinionModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `ClientOpinion not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await ClientOpinionModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `ClientOpinion deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete ClientOpinion");
      return next(new ErrorHandler(400, "Failed to delete ClientOpinion", err));
    }
  },
};
