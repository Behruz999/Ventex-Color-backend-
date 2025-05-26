const { ErrorHandler } = require("../util/error");
const { NewsModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { searchBy, configureAttributesOption } = require("../util/function");

module.exports = {
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

      query["active"] = true;

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };
      const doc = await NewsModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll News");
      return next(new ErrorHandler(400, "Failed to findAll News ", err));
    }
  },

  // Get paginated News
  paginate: async (req, res, next) => {
    let { page, limit, search, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      if (date) {
        query = searchBy(query, date, "date");
      }

      query["active"] = true;

      page = Number(page);
      limit = Number(limit);

      const size = page - 1;
      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
      };

      const docs = await NewsModel.findAndCountAll(options);

      if (!docs) throw new Error("Error on finding and counting all News");

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate News");
      return next(new ErrorHandler(400, "Failed to paginate News ", err));
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

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne News");
      return next(new ErrorHandler(400, "Failed to findOne News ", err));
    }
  },
};
