const { ErrorHandler } = require("../util/error");
const { ConsultationRequestModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");

module.exports = {
  // Get all ConsultationRequests
  findAll: async (req, res, next) => {
    const { full_name, phone, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (full_name) {
        query = searchBy(query, full_name, "full_name", lang);
      }

      if (phone) {
        query = searchBy(query, phone, "phone");
      }

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["status", "active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await ConsultationRequestModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll ConsultationRequests");
      return next(
        new ErrorHandler(400, "Failed to findAll ConsultationRequests", err)
      );
    }
  },

  // Get paginated ConsultationRequests
  paginate: async (req, res, next) => {
    let { page, limit, full_name, phone, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (full_name) {
        query = searchBy(query, full_name, "full_name", lang);
      }

      if (phone) {
        query = searchBy(query, phone, "phone");
      }

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["status", "active"]);

      page = Number(page);
      limit = Number(limit);

      const size = page - 1;

      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
      };

      const docs = await ConsultationRequestModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate ConsultationRequests");
      return next(
        new ErrorHandler(400, "Failed to paginate ConsultationRequests", err)
      );
    }
  },

  // Get one ConsultationRequest
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await ConsultationRequestModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `ConsultationRequest not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne ConsultationRequest");
      return next(
        new ErrorHandler(400, "Failed to findOne ConsultationRequest", err)
      );
    }
  },

  // Update one ConsultationRequest
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const [affectedRows] = await ConsultationRequestModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        const docExists = await ConsultationRequestModel.findByPk(id, {
          attributes: ["id"],
        });
        if (!docExists) {
          return res
            .status(404)
            .json({ message: `ConsultationRequest not found, id: ${id}` });
        }
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "ConsultationRequest was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update ConsultationRequest");
      return next(
        new ErrorHandler(400, "Failed to update ConsultationRequest", err)
      );
    }
  },

  // Delete one ConsultationRequest
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const deleted = await ConsultationRequestModel.destroy({ where: { id } });

      if (deleted === 0)
        return res
          .status(400)
          .json({ message: `ConsultationRequest not found, id: ${id}` });

      return res.status(200).json({
        message: `ConsultationRequest deleted successfully, id: ${id}`,
      });
    } catch (err) {
      console.log(err, "- error on delete ConsultationRequest");
      return next(
        new ErrorHandler(400, "Failed to delete ConsultationRequest", err)
      );
    }
  },
};
