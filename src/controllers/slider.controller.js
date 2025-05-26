const { ErrorHandler } = require("../util/error");
const { SliderModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { removeFile, rollbackFileUploads } = require("../util/deleteFile");

module.exports = {
  // Create new Slider
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await SliderModel.create(req.body);
      return res
        .status(201)
        .json({ message: "Slider was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new Slider");
      return next(new ErrorHandler(400, "Failed to add new Slider", err));
    }
  },

  // Get all Sliders
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

      const doc = await SliderModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Sliders");
      return next(new ErrorHandler(400, "Failed to findAll Sliders", err));
    }
  },

  // Get paginated Sliders
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

      const docs = await SliderModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Sliders");
      return next(new ErrorHandler(400, "Failed to paginate Sliders", err));
    }
  },

  // Get one Slider
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await SliderModel.findOne(options);

      if (!doc)
        return res.status(400).json({ message: `Slider not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Slider");
      return next(new ErrorHandler(400, "Failed to findOne Slider", err));
    }
  },

  // Update one Slider
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await SliderModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc) {
        await rollbackFileUploads(req.body);
        return res.status(404).json({ message: `Slider not found, id: ${id}` });
      }

      if (req.body?.photo) {
        await removeFile(doc, ["photo"]);
      }

      const [affectedRows] = await SliderModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "Slider was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update Slider");
      return next(new ErrorHandler(400, "Failed to update Slider", err));
    }
  },

  // Delete one Slider
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const doc = await SliderModel.findByPk(id, {
        attributes: ["id", "photo"],
      });

      if (!doc)
        return res.status(404).json({ message: `Slider not found, id: ${id}` });

      await removeFile(doc, ["photo"]);

      await SliderModel.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: `Slider deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete Slider");
      return next(new ErrorHandler(400, "Failed to delete Slider", err));
    }
  },
};
