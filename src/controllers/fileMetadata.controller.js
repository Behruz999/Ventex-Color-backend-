const { ErrorHandler } = require("../util/error");
const { FileMetadataModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  makeDateFormat,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new FileMetadata
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date", {
        format: "YYYY-MM-DD HH:mm",
      });
      const doc = await FileMetadataModel.create(req.body);
      return res
        .status(201)
        .json({ message: "FileMetadata was created successfully!", doc });
    } catch (err) {
      console.log(err, "- error on create new FileMetadata");
      return next(new ErrorHandler(400, "Failed to add new FileMetadata", err));
    }
  },

  // Get all FileMetadata
  findAll: async (req, res, next) => {
    const { date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await FileMetadataModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll FileMetadata");
      return next(new ErrorHandler(400, "Failed to findAll FileMetadata", err));
    }
  },

  // Get paginated FileMetadata
  paginate: async (req, res, next) => {
    let { page, limit, date, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      page = Number(page);
      limit = Number(limit);

      if (date) {
        query = searchBy(query, date, "date");
      }

      query = combineQuery(req.query, query, ["active"]);

      const size = page - 1;

      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        ...configureAttributesOption(req.query),
      };

      const docs = await FileMetadataModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate FileMetadata");
      return next(
        new ErrorHandler(400, "Failed to paginate FileMetadata", err)
      );
    }
  },

  // Get one FileMetadata
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await FileMetadataModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `FileMetadata not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne FileMetadata");
      return next(new ErrorHandler(400, "Failed to findOne FileMetadata", err));
    }
  },

  // Update one FileMetadata
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await FileMetadataModel.findByPk(id, {
        attributes: ["id", "path"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res
          .status(404)
          .json({ message: `FileMetadata not found, id: ${id}` });
      }

      req.body.date = makeDateFormat(req, "date", {
        format: "YYYY-MM-DD HH:mm",
        defaultCurrentDate: false,
      });

      if (req.body?.path) {
        await removeFile(doc, ["path"]);
      }

      const [affectedRows] = await FileMetadataModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "FileMetadata was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update FileMetadata");
      return next(new ErrorHandler(400, "Failed to update FileMetadata", err));
    }
  },

  // Delete one FileMetadata
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await FileMetadataModel.findByPk(id, {
        attributes: ["id", "path"],
      });

      if (!doc)
        return res
          .status(404)
          .json({ message: `FileMetadata not found, id: ${id}` });

      await removeFile(doc, ["path"]);

      await FileMetadataModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `FileMetadata deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete FileMetadata");
      return next(new ErrorHandler(400, "Failed to delete FileMetadata", err));
    }
  },
};
