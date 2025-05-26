const { ErrorHandler } = require("../util/error");
const { ContactModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  searchArrayValue,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new Contact
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await ContactModel.create(req.body);
      return res
        .status(201)
        .json({ message: "Contact was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new Contact");
      return next(new ErrorHandler(400, "Failed to add new Contact", err));
    }
  },

  // Get all Contacts
  findAll: async (req, res, next) => {
    const { phone, email, address, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (phone) {
        query = searchArrayValue(query, phone, "phones");
      }

      if (email) {
        query = searchBy(query, email, "email");
      }

      if (address) {
        query = searchBy(query, address, "address", lang);
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await ContactModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Contact");
      return next(new ErrorHandler(400, "Failed to findAll Contact", err));
    }
  },

  // Get paginated Contacts
  paginate: async (req, res, next) => {
    let { page, limit, phone, email, address, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (phone) {
        query = searchArrayValue(query, phone, "phones");
      }

      if (email) {
        query = searchBy(query, email, "email");
      }

      if (address) {
        query = searchBy(query, address, "address", lang);
      }

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

      const docs = await ContactModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Contact");
      return next(new ErrorHandler(400, "Failed to paginate Contact", err));
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

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Contact");
      return next(new ErrorHandler(400, "Failed to findOne Contact", err));
    }
  },

  // Update one Contact
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ContactModel.findByPk(id, {
        attributes: ["id", "photo", "logo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `Contact not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      if (req.body?.logo) {
        await removeFile(doc, ["logo"]);
      }

      const [affectedRows] = await ContactModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "Contact was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update Contact");
      return next(new ErrorHandler(400, "Failed to update Contact", err));
    }
  },

  // Delete one Contact
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await ContactModel.findByPk(id, {
        attributes: ["id", "photo", "logo"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `Contact not found, id: ${id}` });

      await removeFile(doc, ["photo", "logo"]);

      await ContactModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `Contact deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete Contact");
      return next(new ErrorHandler(400, "Failed to delete Contact", err));
    }
  },
};
