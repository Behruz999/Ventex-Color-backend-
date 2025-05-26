const { ErrorHandler } = require("../util/error");
const { NewsModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  makeDateFormat,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");

module.exports = {
  // Create new News
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date");
      await NewsModel.create(req.body);
      return res
        .status(201)
        .json({ message: "News was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new News");
      return next(new ErrorHandler(400, "Failed to add new News", err));
    }
  },

  // Get all News
  findAll: async (req, res, next) => {
    const { search, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await NewsModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll News");
      return next(new ErrorHandler(400, "Failed to findAll News", err));
    }
  },

  // Get paginated News
  paginate: async (req, res, next) => {
    let { page, limit, search, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      page = Number(page);
      limit = Number(limit);

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["active"]);

      const size = page - 1;

      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
      };

      const docs = await NewsModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate News");
      return next(new ErrorHandler(400, "Failed to paginate News", err));
    }
  },

  // Get one News
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await NewsModel.findOne(options);

      if (!doc)
        return res.status(400).json({ message: `News not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne News");
      return next(new ErrorHandler(400, "Failed to findOne News", err));
    }
  },

  // Update one News
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date", {
        format: "YYYY-MM-DD",
        defaultCurrentDate: false,
      });

      const doc = await NewsModel.findByPk(id, {
        attributes: ["id", "photos"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res.status(404).json({ message: `News not found, id: ${id}` });
      }

      const newUpdates = await processRecordUpdates(
        req,
        doc,
        ["photos"],
        "basket"
      );

      const [affectedRows] = await NewsModel.update(newUpdates, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "News was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update News");
      return next(new ErrorHandler(400, "Failed to update News", err));
    }
  },

  // Delete one News
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await NewsModel.findByPk(id, {
        attributes: ["id", "photos"],
      });

      if (!doc)
        return res.status(404).json({ message: `News not found, id: ${id}` });

      await removeFile(doc, ["photos"]);

      await NewsModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `News deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete News");
      return next(new ErrorHandler(400, "Failed to delete News", err));
    }
  },
};
