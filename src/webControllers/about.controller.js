const { ErrorHandler } = require("../util/error");
const { AboutModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all Abouts
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query["active"] = true;
      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };
      const doc = await AboutModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll About");
      return next(new ErrorHandler(400, "Failed to findAll About ", err));
    }
  },

  // Get paginated Abouts
  paginate: async (req, res, next) => {
    let { page, limit, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

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

      const docs = await AboutModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate About");
      return next(new ErrorHandler(400, "Failed to paginate About ", err));
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

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne About");
      return next(new ErrorHandler(400, "Failed to findOne About ", err));
    }
  },
};
