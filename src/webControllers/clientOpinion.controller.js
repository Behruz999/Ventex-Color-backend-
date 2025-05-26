const { ErrorHandler } = require("../util/error");
const { ClientOpinionModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all ClientOpinion
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
      const doc = await ClientOpinionModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll ClientOpinions");
      return next(
        new ErrorHandler(400, "Failed to findAll ClientOpinions", err)
      );
    }
  },

  // Get paginated ClientOpinions
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

      const docs = await ClientOpinionModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate ClientOpinions");
      return next(
        new ErrorHandler(400, "Failed to paginate ClientOpinions", err)
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

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne ClientOpinion");
      return next(
        new ErrorHandler(400, "Failed to findOne ClientOpinion", err)
      );
    }
  },
};
