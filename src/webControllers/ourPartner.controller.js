const { ErrorHandler } = require("../util/error");
const { OurPartnerModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all OurPartners
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
      const doc = await OurPartnerModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll OurPartners");
      return next(new ErrorHandler(400, "Failed to findAll OurPartners", err));
    }
  },

  // Get paginated OurPartners
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

      const docs = await OurPartnerModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate OurPartners");
      return next(new ErrorHandler(400, "Failed to paginate OurPartners", err));
    }
  },

  // Get one OurPartner
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };
      let doc = await OurPartnerModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `OurPartner not found, id: ${id}` });

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne OurPartner");
      return next(new ErrorHandler(400, "Failed to findOne OurPartner", err));
    }
  },
};
