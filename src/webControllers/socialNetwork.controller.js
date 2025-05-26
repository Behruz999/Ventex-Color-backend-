const { ErrorHandler } = require("../util/error");
const { SocialNetworkModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all SocialNetworks
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

      const doc = await SocialNetworkModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll SocialNetworks");
      return next(
        new ErrorHandler(400, "Failed to findAll SocialNetworks", err)
      );
    }
  },

  // Get paginated SocialNetworks
  paginate: async (req, res, next) => {
    let { page, limit, active, language } = req.query;
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

      const docs = await SocialNetworkModel.findAndCountAll(options);
      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);

      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate SocialNetworks");
      return next(
        new ErrorHandler(400, "Failed to paginate SocialNetworks", err)
      );
    }
  },

  // Get one SocialNetwork
  findOne: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const { id } = req.params;
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await SocialNetworkModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `SocialNetwork not found, id: ${id}` });

      doc = await transformData(doc, lang);
      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne SocialNetwork");
      return next(
        new ErrorHandler(400, "Failed to findOne SocialNetwork", err)
      );
    }
  },
};
