const { ErrorHandler } = require("../util/error");
const {
  ProductModel,
  ProductCategoryModel,
  ProductPhotoModel,
  CoatingModel,
} = require("../models/index");
const { transformData } = require("../util/translate");
const {
  searchBy,
  combineQuery,
  configureAttributesOption,
} = require("../util/function");
const { Sequelize } = require("sequelize");
const dbName = process.env?.DB_NAME || "ventex_color";

module.exports = {
  // Create new Product
  create: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      await ProductModel.create(req.body);
      return res
        .status(201)
        .json({ message: "Product was created successfully!" });
    } catch (err) {
      console.log(err, "- error on create new Product");
      return next(new ErrorHandler(400, "Failed to add new Product", err));
    }
  },

  // Get all Products
  findAll: async (req, res, next) => {
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query["active"] = true;

      query = combineQuery(req.query, query, ["category_id"]);

      const options = {
        where: query,
        // ...configureAttributesOption(req.query),
        // // grok
        attributes: [
          "id",
          "title",
          [
            Sequelize.literal(`
                (SELECT JSON_ARRAYAGG(jt.photo_path)
                 FROM ${dbName}.product_photos product_photos
                 LEFT JOIN JSON_TABLE(
                   product_photos.photos,
                   '$[*]'
                   COLUMNS (photo_path VARCHAR(255) PATH '$')
                 ) AS jt ON TRUE
                 WHERE product_photos.product_id = Product.id)
              `),
            "photos",
          ],
        ],
        include: [
          {
            model: ProductCategoryModel,
            as: "category",
            attributes: ["id", "title", "photo"],
          },
        ],

        // // grok (best one, but photos: "img1.jpg, img2.jpg, ...")
        // attributes: [
        //   "id",
        //   "title",
        //   // [Sequelize.col("category.id"), "categoryId"],
        //   // [Sequelize.col("category.title"), "categoryTitle"],
        //   // [Sequelize.col("category.photo"), "categoryPhoto"],
        //   [
        //     Sequelize.literal(`
        //       (SELECT GROUP_CONCAT(jt.photo_path)
        //        FROM ventex_color.product_photos ph
        //        LEFT JOIN JSON_TABLE(
        //          ph.photos,
        //          '$[*]'
        //          COLUMNS (photo_path VARCHAR(255) PATH '$')
        //        ) AS jt ON TRUE
        //        WHERE ph.product_id = Product.id)
        //     `),
        //     "photos",
        //   ],
        // ],

        // include: [
        //   {
        //     model: ProductCategoryModel,
        //     as: "category",
        //     attributes: ["id", "title", "photo"],
        //   },
        // ],

        // attributes: [
        //   "id",
        //   "title",
        //   [col("category.id"), "category_id"],
        //   [col("category.title"), "category_title"],
        //   [col("category.photo"), "category_photo"],
        //   [fn("GROUP_CONCAT", col("jt.photo_path")), "photos"],
        // ],
        // include: [
        //   {
        //     model: ProductCategoryModel,
        //     as: "category",
        //     attributes: [],
        //     required: false,
        //   },
        // ],
        // // inject the JSON_TABLE join for “product_photos” → “jt”
        // // note: alias “product_photos” must match your association’s ‘as’
        // join: literal(`
        //   LEFT JOIN ventex_color.product_photos AS product_photos
        //     ON ${productTableName}.id = product_photos.product_id
        //   LEFT JOIN JSON_TABLE(
        //     product_photos.photos,
        //     '$[*]' COLUMNS (
        //       photo_path VARCHAR(255) PATH '$'
        //     )
        //   ) AS jt
        //     ON TRUE
        // `),
        // group: [`${productTableName}.id`],
        // raw: true, // so Sequelize doesn’t try to wrap everything in its own SELECT
        // subQuery: false, // avoids an extra nested sub-select
      };
      const doc = await ProductModel.findAll(options);
      const docs = await transformData(doc, lang);
      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on findAll Products");
      return next(new ErrorHandler(400, "Failed to findAll Products", err));
    }
    // // for string photo paths:
    // SELECT product.id, product.title, category.id, category.title, category.photo, GROUP_CONCAT(jt.photo_path) AS photos
    // FROM ventex_color.products product
    // LEFT JOIN ventex_color.product_categories category ON product.category_id = category.id
    // LEFT JOIN ventex_color.product_photos ph ON product.id = ph.product_id
    // LEFT JOIN JSON_TABLE(ph.photos, '$[*]' COLUMNS (photo_path VARCHAR(255) PATH '$')) AS jt ON TRUE
    // GROUP BY product.id

    // // for photo paths become inside of array (our intention)
    // SELECT
    //     p.id,
    //     p.title,
    //     (
    //         SELECT JSON_ARRAYAGG(jt.photo_path)
    //         FROM ventex_color.product_photos ph
    //         LEFT JOIN JSON_TABLE(
    //             ph.photos,
    //             '$[*]'
    //             COLUMNS (photo_path VARCHAR(255) PATH '$')
    //         ) AS jt ON TRUE
    //         WHERE ph.product_id = p.id
    //     ) AS photos,
    //     c.id AS category_id,
    //     c.title AS category_title,
    //     c.photo AS category_photo
    // FROM ventex_color.products p
    // LEFT JOIN ventex_color.product_categories c ON p.category_id = c.id
    // WHERE [your_where_conditions];
  },

  // // Get all Products
  // findAll: async (req, res, next) => {
  //   const { search, language } = req.query;
  //   const lang = language || "UZL";
  //   try {
  //     let query = {};

  //     if (search) {
  //       query = searchBy(query, search, "title", lang);
  //     }

  //     query = combineQuery(req.query, query, ["category_id", "active"]);

  //     const options = {
  //       where: query,
  //       ...configureAttributesOption(req.query),
  //       include: [
  //         {
  //           model: ProductCategoryModel,
  //           as: "category",
  //           attributes: { exclude: ["created_at", "updated_at"] },
  //         },
  //       ],
  //     };

  //     const doc = await ProductModel.findAll(options);

  //     const docs = await transformData(doc, lang);

  //     return res.status(200).json(docs);
  //   } catch (err) {
  //     console.log(err, "- error on findAll Products");
  //     return next(new ErrorHandler(400, "Failed to findAll Products", err));
  //   }
  // },

  // Get paginated Products
  paginate: async (req, res, next) => {
    let { page, limit, language } = req.query;
    const lang = language || "UZL";
    try {
      let query = {};

      query["active"] = true;

      query = combineQuery(req.query, query, ["category_id"]);

      page = Number(page);
      limit = Number(limit);

      const size = page - 1;
      const options = {
        limit: limit,
        offset: size * limit,
        where: query,
        // ...configureAttributesOption(req.query),
        attributes: [
          "id",
          "title",
          [
            Sequelize.literal(`
                (SELECT JSON_ARRAYAGG(jt.photo_path)
                 FROM ${dbName}.product_photos product_photos
                 LEFT JOIN JSON_TABLE(
                   product_photos.photos,
                   '$[*]'
                   COLUMNS (photo_path VARCHAR(255) PATH '$')
                 ) AS jt ON TRUE
                 WHERE product_photos.product_id = Product.id)
              `),
            "photos",
          ],
        ],
        include: [
          {
            model: ProductCategoryModel,
            as: "category",
            attributes: ["id", "title", "photo"],
          },
        ],
      };

      const docs = await ProductModel.findAndCountAll(options);

      docs.rows = await transformData(docs?.rows, lang);

      docs["totalPages"] = Math.ceil(docs.count / limit);
      docs["page"] = page;
      docs["limit"] = limit;

      return res.status(200).json(docs);
    } catch (err) {
      console.log(err, "- error on paginate Products");
      return next(new ErrorHandler(400, "Failed to paginate Products", err));
    }
    // // for string photo paths (photos: "img1.jpg, img2.jpg, ..."):
    // SELECT product.id, product.title, category.id, category.title, category.photo, GROUP_CONCAT(jt.photo_path) AS photos
    // FROM ventex_color.products product
    // LEFT JOIN ventex_color.product_categories category ON product.category_id = category.id
    // LEFT JOIN ventex_color.product_photos ph ON product.id = ph.product_id
    // LEFT JOIN JSON_TABLE(ph.photos, '$[*]' COLUMNS (photo_path VARCHAR(255) PATH '$')) AS jt ON TRUE
    // GROUP BY product.id

    // // for photo paths become inside of array (our intention: (photos: ["img1.jpg", "img2.jpg", ...]))
    // SELECT
    //     p.id,
    //     p.title,
    //     (
    //         SELECT JSON_ARRAYAGG(jt.photo_path)
    //         FROM ventex_color.product_photos ph
    //         LEFT JOIN JSON_TABLE(
    //             ph.photos,
    //             '$[*]'
    //             COLUMNS (photo_path VARCHAR(255) PATH '$')
    //         ) AS jt ON TRUE
    //         WHERE ph.product_id = p.id
    //     ) AS photos,
    //     c.id AS category_id,
    //     c.title AS category_title,
    //     c.photo AS category_photo
    // FROM ventex_color.products p
    // LEFT JOIN ventex_color.product_categories c ON p.category_id = c.id
    // WHERE [your_where_conditions];
  },

  // // Get paginated Products
  // paginate: async (req, res, next) => {
  //   let { page, limit, search, language } = req.query;
  //   const lang = language || "UZL";
  //   try {
  //     let query = {};

  //     page = Number(page);
  //     limit = Number(limit);

  //     if (search) {
  //       query = searchBy(query, search, "title", lang);
  //     }

  //     query = combineQuery(req.query, query, ["category_id", "active"]);

  //     const size = page - 1;

  //     const options = {
  //       limit: limit,
  //       offset: size * limit,
  //       where: query,
  //       ...configureAttributesOption(req.query),
  //       include: [
  //         {
  //           model: ProductCategoryModel,
  //           as: "category",
  //           attributes: { exclude: ["created_at", "updated_at"] },
  //         },
  //       ],
  //     };

  //     const docs = await ProductModel.findAndCountAll(options);

  //     docs.rows = await transformData(docs?.rows, lang);

  //     docs["totalPages"] = Math.ceil(docs.count / limit);
  //     docs["page"] = page;
  //     docs["limit"] = limit;

  //     return res.status(200).json(docs);
  //   } catch (err) {
  //     console.log(err, "- error on paginate Products");
  //     return next(new ErrorHandler(400, "Failed to paginate Products", err));
  //   }
  // },

  // Get one Product
  findOne: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const options = {
        where: { id },
        // ...configureAttributesOption(req.query),
        // attributes: [],
        include: [
          {
            model: ProductPhotoModel,
            attributes: ["id", "photos"],
            as: "product_photos",
            include: [
              {
                model: CoatingModel,
                attributes: ["id", "title", "photo"],
                as: "coating",
              },
            ],
          },
          {
            model: ProductCategoryModel,
            attributes: { exclude: ["created_at", "updated_at"] },
            as: "category",
          },
        ],
        // include: [
        //   {
        //     model: ProductPhotoModel,
        //     attributes: [
        //       "id",
        //       // "coating_id",
        //       "photos",
        //       [Sequelize.literal("`product_photos->coating`.`id`"), "id"],
        //       [Sequelize.literal("`product_photos->coating`.`title`"), "title"],
        //       [Sequelize.literal("`product_photos->coating`.`photo`"), "photo"],
        //     ],
        //     as: "product_photos",
        //     include: [
        //       {
        //         model: CoatingModel,
        //         attributes: [], // Prevent nesting of coating object
        //         as: "coating",
        //       },
        //     ],
        //   },
        //   {
        //     model: ProductCategoryModel,
        //     attributes: { exclude: ["created_at", "updated_at"] },
        //     as: "category",
        //   },
        // ],
      };
      let doc = await ProductModel.findOne(options);

      if (!doc)
        return res
          .status(400)
          .json({ message: `Product not found, id: ${id}` });

      doc = await transformData(doc, lang);

      return res.status(200).json(doc);
    } catch (err) {
      console.log(err, "- error on findOne Product");
      return next(new ErrorHandler(400, "Failed to findOne Product", err));
    }
  },

  // // Get one Product
  // findOne: async (req, res, next) => {
  //   const { id } = req.params;
  //   const { language } = req.query;
  //   const lang = language || "UZL";
  //   try {
  //     const options = {
  //       where: { id },
  //       ...configureAttributesOption(req.query),
  //       include: [
  //         {
  //           model: ProductCategoryModel,
  //           as: "category",
  //           attributes: { exclude: ["created_at", "updated_at"] },
  //         },
  //       ],
  //     };

  //     let doc = await ProductModel.findOne(options);

  //     if (!doc)
  //       return res
  //         .status(400)
  //         .json({ message: `Product not found, id: ${id}` });

  //     doc = await transformData(doc, lang, { translate: Boolean(language) });

  //     return res.status(200).json(doc);
  //   } catch (err) {
  //     console.log(err, "- error on findOne Product");
  //     return next(new ErrorHandler(400, "Failed to findOne Product", err));
  //   }
  // },

  // Update one Product
  update: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const [affectedRows] = await ProductModel.update(req.body, {
        where: { id },
      });

      if (affectedRows === 0) {
        const docExists = await ProductModel.findByPk(id, {
          attributes: ["id"],
        });
        if (!docExists) {
          return res
            .status(404)
            .json({ message: `Product not found, id: ${id}` });
        }
        return res.status(200).json({
          message: `No changes were made. Data is already up to date`,
        });
      }

      return res
        .status(200)
        .json({ message: "Product was updated successfully!" });
    } catch (err) {
      console.log(err, "- error on update Product");
      return next(new ErrorHandler(400, "Failed to update Product", err));
    }
  },

  // Delete one Product
  delete: async (req, res, next) => {
    const { id } = req.params;
    const { language } = req.query;
    const lang = language || "UZL";
    try {
      const deleted = await ProductModel.destroy({ where: { id } });

      if (deleted === 0)
        return res
          .status(400)
          .json({ message: `Product not found, id: ${id}` });

      return res
        .status(200)
        .json({ message: `Product deleted successfully, id: ${id}` });
    } catch (err) {
      console.log(err, "- error on delete Product");
      return next(new ErrorHandler(400, "Failed to delete Product", err));
    }
  },
};
