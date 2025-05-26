const { ErrorHandler } = require("../util/error");
const { CoatingModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new Coating
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await CoatingModel.create(req.body);
      return res
        .status(201)
        .json({ message: "Coating was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new Coating");
      return next(new ErrorHandler(400, "Failed to add new Coating", err));
    }
  },

  // Get all Coatings
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

      const doc = await CoatingModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Coating");
      return next(new ErrorHandler(400, "Failed to findAll Coating", err));
    }
  },

  // Get paginated Coatings
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

      const docs = await CoatingModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Coating");
      return next(new ErrorHandler(400, "Failed to paginate Coating", err));
    }
  },

  // Get one Coating
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await CoatingModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `Coating not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Coating");
      return next(new ErrorHandler(400, "Failed to findOne Coating", err));
    }
  },

  // Update one Coating
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await CoatingModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `Coating not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await CoatingModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "Coating was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update Coating");
      return next(new ErrorHandler(400, "Failed to update Coating", err));
    }
  },

  // Delete one Coating
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await CoatingModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `Coating not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await CoatingModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `Coating deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete Coating");
      return next(new ErrorHandler(400, "Failed to delete Coating", err));
    }
  },
};
