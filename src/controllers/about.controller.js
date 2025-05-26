const { ErrorHandler } = require("../util/error");
const { AboutModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { combineQuery, configureAttributesOption } = require("../util/function");

module.exports = {
  // Create new About
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await AboutModel.create(req.body);
      return res
        .status(201)
        .json({ message: "About was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new About");
      return next(new ErrorHandler(400, "Failed to add new About", err));
    }
  },

  // Get all Abouts
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await AboutModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll About");
      return next(new ErrorHandler(400, "Failed to findAll About", err));
    }
  },

  // Get paginated Abouts
  paginate: async (req, res, next) => {
    let { page, limit, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

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

      const docs = await AboutModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate About");
      return next(new ErrorHandler(400, "Failed to paginate About", err));
    }
  },

  // Get one About
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await AboutModel.findOne(options);

      if (!doc)
        return res.status(400).json({ message: `About not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne About");
      return next(new ErrorHandler(400, "Failed to findOne About", err));
    }
  },

  // Update one About
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await AboutModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res.status(404).json({ message: `About not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await AboutModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "About was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update About");
      return next(new ErrorHandler(400, "Failed to update About", err));
    }
  },

  // Delete one About
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await AboutModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res.status(404).json({ message: `About not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await AboutModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `About deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete About");
      return next(new ErrorHandler(400, "Failed to delete About", err));
    }
  },
};
