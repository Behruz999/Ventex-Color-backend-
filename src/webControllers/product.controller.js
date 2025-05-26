const { ErrorHandler } = require("../util/error");
const {
  ProductModel,
  ProductCategoryModel,
  ProductPhotoModel,
  CoatingModel,
} = require("../models/index");
const { transformData } = require("../util/translate");
const { configureAttributesOption, combineQuery } = require("../util/function");
const { Sequelize } = require("sequelize");
const dbName = process.env?.DB_NAME || "ventex_color";

module.exports = {
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
              COALESCE(
                (SELECT JSON_ARRAYAGG(jt.photo_path)
                 FROM ${dbName}.product_photos product_photos
                 LEFT JOIN JSON_TABLE(
                   product_photos.photos,
                   '$[*]'
                   COLUMNS (photo_path VARCHAR(255) PATH '$')
                 ) AS jt ON TRUE
                 WHERE product_photos.product_id = Product.id
                 AND jt.photo_path IS NOT NULL
                 AND jt.photo_path != ''
                 AND JSON_LENGTH(product_photos.photos) > 0),
                '[]'
              )
            `),
            "photos",
          ],
          // [
          //   Sequelize.literal(`
          //     (SELECT JSON_ARRAYAGG(jt.photo_path)
          //      FROM ${dbName}.product_photos product_photos
          //      LEFT JOIN JSON_TABLE(
          //        product_photos.photos,
          //        '$[*]'
          //        COLUMNS (photo_path VARCHAR(255) PATH '$')
          //      ) AS jt ON TRUE
          //      WHERE product_photos.product_id = Product.id)
          //   `),
          //   "photos",
          // ], // this'll work, but resulting photos array will include null when product_photos table record has empty photos array
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
              COALESCE(
                (SELECT JSON_ARRAYAGG(jt.photo_path)
                 FROM ${dbName}.product_photos product_photos
                 LEFT JOIN JSON_TABLE(
                   product_photos.photos,
                   '$[*]'
                   COLUMNS (photo_path VARCHAR(255) PATH '$')
                 ) AS jt ON TRUE
                 WHERE product_photos.product_id = Product.id
                 AND jt.photo_path IS NOT NULL
                 AND jt.photo_path != ''
                 AND JSON_LENGTH(product_photos.photos) > 0),
                '[]'
              )
            `),
            "photos",
          ],
          // [
          //   Sequelize.literal(`
          //     (SELECT JSON_ARRAYAGG(jt.photo_path)
          //      FROM ${dbName}.product_photos product_photos
          //      LEFT JOIN JSON_TABLE(
          //        product_photos.photos,
          //        '$[*]'
          //        COLUMNS (photo_path VARCHAR(255) PATH '$')
          //      ) AS jt ON TRUE
          //      WHERE product_photos.product_id = Product.id)
          //   `),
          //   "photos",
          // ], // this'll work, but resulting photos array will include null when product_photos table record has empty photos array
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
};
