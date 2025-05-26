const { ErrorHandler } = require("../util/error");
const { VideoMediaModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
  makeDateFormat,
} = require("../util/function");

module.exports = {
  // Create new VideoMedia
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date");
      await VideoMediaModel.create(req.body);
      return res
        .status(201)
        .json({ message: "VideoMedia was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new VideoMedia");
      return next(new ErrorHandler(400, "Failed to add new VideoMedia", err));
    }
  },

  // Get all VideoMedias
  findAll: async (req, res, next) => {
    const { search, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await VideoMediaModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll VideoMedias");
      return next(new ErrorHandler(400, "Failed to findAll VideoMedias", err));
    }
  },

  // Get paginated VideoMedias
  paginate: async (req, res, next) => {
    let { page, limit, search, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchBy(query, search, "title", lang);
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

      const docs = await VideoMediaModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate VideoMedias");
      return next(new ErrorHandler(400, "Failed to paginate VideoMedias", err));
    }
  },

  // Get one VideoMedia
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await VideoMediaModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `VideoMedia not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne VideoMedia");
      return next(new ErrorHandler(400, "Failed to findOne VideoMedia", err));
    }
  },

  // Update one VideoMedia
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      req.body.date = makeDateFormat(req, "date", {
        defaultCurrentDate: false,
      });
      const [affectedRows] = await VideoMediaModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        const docExists = await VideoMediaModel.findByPk(id, {
          attributes: ["id"],
        });
        if (!docExists) {
          return res
            .status(404)
            .json({ message: `VideoMedia not found, id: ${id}` });
        }
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "VideoMedia was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update VideoMedia");
      return next(new ErrorHandler(400, "Failed to update VideoMedia", err));
    }
  },

  // Delete one VideoMedia
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const deleted = await VideoMediaModel.destroy({ where: { id } });

      if (deleted === 0) {
        return res
          .status(400)
          .json({ message: `VideoMedia not found, id: ${id}` });
      }

      return res.status(200).json({
        message: `VideoMedia deleted successfully, id: ${id}`,
      });
    } catch (err) {
      console.log(err, "- error on delete VideoMedia");
      return next(new ErrorHandler(400, "Failed to delete VideoMedia", err));
    }
  },
};
