const { ErrorHandler } = require("../util/error");
const { SocialNetworkModel } = require("../models/index");
const { combineQuery, configureAttributesOption } = require("../util/function");

module.exports = {
  // Create new SocialNetwork
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await SocialNetworkModel.create(req.body);
      return res
        .status(201)
        .json({ message: "SocialNetwork was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new SocialNetwork");
      return next(
        new ErrorHandler(400, "Failed to add new SocialNetwork", err)
      );
    }
  },

  // Get all SocialNetworks
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

      const docs = await SocialNetworkModel.findAll(options);

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

      const docs = await SocialNetworkModel.findAndCountAll(options);

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
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      const doc = await SocialNetworkModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `SocialNetwork not found, id: ${id}` });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne SocialNetwork");
      return next(
        new ErrorHandler(400, "Failed to findOne SocialNetwork", err)
      );
    }
  },

  // Update one SocialNetwork
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const [affectedRows] = await SocialNetworkModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        const docExists = await SocialNetworkModel.findByPk(id, {
          attributes: ["id"],
        });
        if (!docExists) {
          return res
            .status(404)
            .json({ message: `SocialNetwork not found, id: ${id}` });
        }
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "SocialNetwork was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update SocialNetwork");
      return next(new ErrorHandler(400, "Failed to update SocialNetwork", err));
    }
  },

  // Delete one SocialNetwork
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const deleted = await SocialNetworkModel.destroy({ where: { id } });

      if (deleted === 0)
        return res
          .status(400)
          .json({ message: `SocialNetwork not found, id: ${id}` });

      return res
        .status(200)
        .json({ message: `SocialNetwork deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete SocialNetwork");
      return next(new ErrorHandler(400, "Failed to delete SocialNetwork", err));
    }
  },
};
