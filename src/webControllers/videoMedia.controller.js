const { ErrorHandler } = require("../util/error");
const { VideoMediaModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption } = require("../util/function");

module.exports = {
  // Get all VideoMedias
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query["active"] = true;

      const doc = await VideoMediaModel.findAll({
        where: query,
        ...configureAttributesOption(req.query),
      });

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll VideoMedias");
      return next(new ErrorHandler(400, "Failed to findAll VideoMedias ", err));
    }
  },

  // Get paginated VideoMedias
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

      let doc = await VideoMediaModel.findAndCountAll(options);

      doc.rows = await transformData(doc?.rows, lang);

      doc["totalPages"] = Math.ceil(doc.count / limit);
      doc["page"] = page;
      doc["limit"] = limit;

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on paginate VideoMedias");
      return next(
        new ErrorHandler(400, "Failed to paginate VideoMedias ", err)
      );
    }
  },

  // Get one VideoMedia
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let doc = await VideoMedia.findOne({
        where: { id },
        ...configureAttributesOption(req.query),
      });

      if (!doc)
        return res
          .status(400)
          .json({ message: `VideoMedia not found, id: ${id}` });

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne VideoMedia");
      return next(new ErrorHandler(400, "Failed to findOne VideoMedia ", err));
    }
  },
};
