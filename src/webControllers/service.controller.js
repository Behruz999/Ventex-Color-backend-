const { ErrorHandler } = require("../util/error");
const { ServiceModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all Services
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
      const doc = await ServiceModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Services");
      return next(new ErrorHandler(400, "Failed to findAll Services", err));
    }
  },

  // Get paginated Services
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

      const docs = await ServiceModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Services");
      return next(new ErrorHandler(400, "Failed to paginate Services", err));
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

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Service");
      return next(new ErrorHandler(400, "Failed to findOne Service", err));
    }
  },
};
