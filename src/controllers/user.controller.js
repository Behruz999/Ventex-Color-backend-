const { ErrorHandler } = require("../util/error");
const { UserModel } = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  searchQueryMultiple,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");

module.exports = {
  // Create new User
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await UserModel.create(req.body);
      return res
        .status(201)
        .json({ message: "User was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new User");
      return next(new ErrorHandler(400, "Failed to add new User", err));
    }
  },

  // Get all User
  findAll: async (req, res, next) => {
    const { search, phone, role, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchQueryMultiple(search, "first_name", "last_name");
      }

      if (phone) {
        query = searchBy(query, phone, "phone");
      }

      if (role) {
        query = searchBy(query, role, "role");
      }

      query = combineQuery(req.query, query, ["active"]);

      const options = {
        where: query,
        ...configureAttributesOption(req.query),
      };

      const doc = await UserModel.findAll(options);

      const docs = await transformData(doc, lang);

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll User");
      return next(new ErrorHandler(400, "Failed to findAll User", err));
    }
  },

  // Get paginated User
  paginate: async (req, res, next) => {
    let { page, limit, search, phone, role, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      if (search) {
        query = searchQueryMultiple(search, "first_name", "last_name");
      }

      if (phone) {
        query = searchBy(query, phone, "phone");
      }

      if (role) {
        query = searchBy(query, role, "role");
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

      const docs = await UserModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate User");
      return next(new ErrorHandler(400, "Failed to paginate User", err));
    }
  },

  // Get one User
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        ...configureAttributesOption(req.query),
      };

      let doc = await UserModel.findOne(options);

      if (!doc)
        return res.status(400).json({ message: `User not found, id: ${id}` });

      doc = await transformData(doc, lang, { translate: Boolean(language) });

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne User");
      return next(new ErrorHandler(400, "Failed to findOne User", err));
    }
  },

  // Update one User
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const [affectedRows] = await UserModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        const docExists = await UserModel.findByPk(id, {
          attributes: ["id"],
        });
        if (!docExists) {
          return res.status(404).json({ message: `User not found, id: ${id}` });
        }
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "User was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update User");
      return next(new ErrorHandler(400, "Failed to update User", err));
    }
  },

  // Delete one User
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const deleted = await UserModel.destroy({ where: { id } });

      if (deleted === 0)
        return res.status(400).json({ message: `User not found, id: ${id}` });

      return res
        .status(200)
        .json({ message: `User deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete User");
      return next(new ErrorHandler(400, "Failed to delete User", err));
    }
  },
};
