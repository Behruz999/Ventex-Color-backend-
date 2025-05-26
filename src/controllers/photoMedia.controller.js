const { ErrorHandler } = require("../util/error");
const { PhotoMediaModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
  makeDateFormat,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new PhotoMedia
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date");
      await PhotoMediaModel.create(req.body);
      return res
        .status(201)
        .json({ message: "PhotoMedia was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new PhotoMedia");
      return next(new ErrorHandler(400, "Failed to add new PhotoMedia", err));
    }
  },

  // Get all PhotoMedia
  findAll: async (req, res, next) => {
    const { date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await PhotoMediaModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll PhotoMedia");
      return next(new ErrorHandler(400, "Failed to findAll PhotoMedia", err));
    }
  },

  // Get paginated PhotoMedia
  paginate: async (req, res, next) => {
    let { page, limit, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (date) {
        query = searchBy(query, date, "date");
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

      const docs = await PhotoMediaModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate PhotoMedia");
      return next(new ErrorHandler(400, "Failed to paginate PhotoMedia", err));
    }
  },

  // Get one PhotoMedia
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await PhotoMediaModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `PhotoMedia not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne PhotoMedia");
      return next(new ErrorHandler(400, "Failed to findOne PhotoMedia", err));
    }
  },

  // Update one PhotoMedia
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await PhotoMediaModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `PhotoMedia not found, id: ${id}` });
      }

      req.body.date = makeDateFormat(req, "date", {
        defaultCurrentDate: false,
      });

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await PhotoMediaModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "PhotoMedia was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update PhotoMedia");
      return next(new ErrorHandler(400, "Failed to update PhotoMedia", err));
    }
  },

  // Delete one PhotoMedia
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await PhotoMediaModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `PhotoMedia not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await PhotoMediaModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `PhotoMedia deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete PhotoMedia");
      return next(new ErrorHandler(400, "Failed to delete PhotoMedia", err));
    }
  },
};
