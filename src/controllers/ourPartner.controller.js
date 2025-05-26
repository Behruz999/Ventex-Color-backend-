const { ErrorHandler } = require("../util/error");
const { OurPartnerModel } = require("../models/index");
const { transformData } = require("../util/translate");
const { combineQuery, configureAttributesOption } = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new OurPartner
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await OurPartnerModel.create(req.body);
      return res
        .status(201)
        .json({ message: "OurPartner was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new OurPartner");
      return next(new ErrorHandler(400, "Failed to add new OurPartner", err));
    }
  },

  // Get all OurPartners
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await OurPartnerModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll OurPartner");
      return next(new ErrorHandler(400, "Failed to findAll OurPartner", err));
    }
  },

  // Get paginated OurPartners
  paginate: async (req, res, next) => {
    let { page, limit, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

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

      const docs = await OurPartnerModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate OurPartner");
      return next(new ErrorHandler(400, "Failed to paginate OurPartner", err));
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

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne OurPartner");
      return next(new ErrorHandler(400, "Failed to findOne OurPartner", err));
    }
  },

  // Update one OurPartner
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await OurPartnerModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `OurPartner not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await OurPartnerModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "OurPartner was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update OurPartner");
      return next(new ErrorHandler(400, "Failed to update OurPartner", err));
    }
  },

  // Delete one OurPartner
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await OurPartnerModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `OurPartner not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await OurPartnerModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `OurPartner deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete OurPartner");
      return next(new ErrorHandler(400, "Failed to delete OurPartner", err));
    }
  },
};
