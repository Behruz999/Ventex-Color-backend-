const { ErrorHandler } = require("../util/error");
const { ContactModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all Contacts
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
      const doc = await ContactModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Contact");
      return next(new ErrorHandler(400, "Failed to findAll Contact ", err));
    }
  },

  // Get paginated Contacts
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

      const docs = await ContactModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Contact");
      return next(new ErrorHandler(400, "Failed to paginate Contact ", err));
    }
  },

  // Get one Contact
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };
      let doc = await ContactModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `Contact not found, id: ${id}` });

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Contact");
      return next(new ErrorHandler(400, "Failed to findOne Contact ", err));
    }
  },
};
