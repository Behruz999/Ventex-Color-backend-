const { Op, Sequelize } = require("sequelize");
const crypto = require("crypto");
const moment = require("moment");
const { safeParse } = require("./translate");
const { deleteFile } = require("../util/deleteFile");

// MySQL
function searchQueryObject(search, fields, lang) {
  if (!search) return {};

  // Convert search term to lowercase for case-insensitivity
  const searchRegex = `%${search.toLowerCase()}%`;

  // Ensure fields is an array
  if (typeof fields === "string") {
    fields = [fields];
  }

  // Build an array of `LIKE` conditions for each field
  const orConditions = fields.map((field) => ({
    [`${field}.${lang}`]: { [Op.like]: searchRegex },
  }));

  return { [Op.or]: orConditions };
}

function searchQuery(search, field) {
  if (!search) return {};

  const searchRegex = `%${search}%`;

  const orConditions = {
    [`${field}`]: { [Op.like]: searchRegex },
  };

  return orConditions;
}

function searchQueryMultiple(search, field1, field2) {
  const searchRegex = `%${search}%`;

  const orConditions = {
    [Op.or]: [
      {
        [`${field1}`]: { [Op.like]: searchRegex },
      },
      {
        [`${field2}`]: { [Op.like]: searchRegex },
      },
    ],
  };
  return orConditions;
}

function searchBy(remainedFilters, searching, databaseField, language) {
  let fieldTerm = language
    ? searchQueryObject(searching, databaseField, language)
    : searchQuery(searching, databaseField);

  return {
    [Op.and]: [remainedFilters, fieldTerm],
  };
}

function searchArrayValue(remainedFilters, searching, databaseField) {
  if (!["string", "number"].includes(typeof searching) || !databaseField) {
    return {};
  }

  // Escape input to prevent SQL injection
  const safeValue = searching.replace(/"/g, '\\"'); // Escape quotes for SQL safety

  return {
    [Op.and]: [
      remainedFilters || {},
      Sequelize.literal(
        `JSON_SEARCH(${databaseField}, 'all', '%${safeValue}%') IS NOT NULL`
      ),
    ],
  };
}

function makeDateFormat(request, fieldName, options) {
  const defaults = { format: "YYYY-MM-DD", defaultCurrentDate: true };
  const settings = { ...defaults, ...options };

  if (request.body?.[fieldName]) {
    return moment(request.body?.[fieldName])
      .format(settings?.format)
      .toString();
  }

  return settings?.defaultCurrentDate
    ? moment().format(settings?.format).toString()
    : undefined;
}

function searchDates(start_field, end_field, startDate, endDate) {
  if (start_field && end_field) {
    return {
      [`${start_field}`]: {
        [Op.lte]: endDate,
      },
      [`${end_field}`]: {
        [Op.gte]: startDate,
      },
    };
  }

  if (startDate && end_field == null) {
    return { [`${start_field}`]: { [Op.gte]: startDate, [Op.lte]: endDate } };
  }
}

function filterDates(start_field, end_field, startDate, endDate) {
  if (start_field && end_field) {
    return {
      [Op.or]: [
        {
          [`${end_field}`]: {
            [Op.lt]: startDate,
          },
        },
        {
          [`${start_field}`]: {
            [Op.gt]: endDate,
          },
        },
      ],
    };
  }
}

// function basicDateFilter(fieldName, startDate, endDate) {
//   if (startDate && endDate) {
//     return {
//       [Op.and]: [
//         {
//           [`${fieldName}`]: {
//             [Op.gte]: startDate,
//           },
//         },
//         {
//           [`${fieldName}`]: {
//             [Op.lte]: endDate,
//           },
//         },
//       ],
//     };
//   }
// }

function basicDateFilter(fieldName, startDate, endDate) {
  const filter = {};

  if (startDate || endDate) {
    filter[fieldName] = {};
    if (startDate) filter[fieldName][Op.gte] = startDate;
    if (endDate) filter[fieldName][Op.lte] = endDate;
  }

  return Object.keys(filter).length ? filter : undefined;
}

async function processRecordUpdates(
  request,
  databaseRecord, // baza dagi dokument
  imageFileFields, // o'zida rasm/fayl url larni saqlovchi field nomlari
  basketField // o'zida o'chirilishi kerak bo'lgan rasm/fayl url larni saqlovchi array field nomi
) {
  let dbDataValues = { ...(databaseRecord?.dataValues || databaseRecord) };
  let newUpdates = {}; // foydalanuvchi o'zgartimoqchi bo'lgan oxirgi o'zgarishlarni saqlaydi
  const isDeletingUrlPresent =
    request.body?.[basketField] && request.body?.[basketField]?.length > 0; // birorta o'chirmoqchi bo'lgan rasm ni url sini basket array da jo'natishi kerak

  // step 1: o'chirilishi kerak bo'lgan rasm/fayl larni o'chirib yuboriladi
  if (isDeletingUrlPresent) {
    let parsedJsonField;

    // o'chirilishi kerak bo'lgan har bir rasm bo'yicha yurib chiqiladi
    for (const field of imageFileFields) {
      // ko'rsatilgan o'zida rasm/fayl larni saqlovchi field lar bo'yicha yuriladi
      parsedJsonField = safeParse(dbDataValues[field]);
      for (const filePath of request.body?.[basketField]) {
        // har bir o'chirilishi kerak bo'lgan url bo'yicha yuriladi
        if (
          Array.isArray(parsedJsonField) &&
          typeof parsedJsonField === "object"
        ) {
          const isAllItemsString = parsedJsonField?.every(
            (item) => typeof item === "string"
          ); // array ni har bir elementi string (image_url) ligini tekshiriladi

          if (isAllItemsString) {
            await deleteFile(filePath); // rasm/fayl o'chiriladi
            const index = parsedJsonField.findIndex((url) => url == filePath); // url array da joylashgan indeksi topiladi

            if (index !== -1) {
              parsedJsonField.splice(index, 1);
              dbDataValues[field] = parsedJsonField; // baza dagi rasm/fayl ham o'chiriladi
              newUpdates[field] = parsedJsonField;
            }
          }
        } else if (typeof parsedJsonField === "string") {
          // yagona rasm url bor field bo'lsa, shunchaki rasm/fayl ni sistemadan o'chirib yuboriladi
          await deleteFile(filePath);
        }
      }
    }
    delete request.body[basketField];
  }

  // step 2: yangi yuklangan rasm/fayl larni baza ga saqlash
  for (const [bodyKey, bodyValue] of Object.entries(request.body)) {
    if (bodyKey === "photos") {
      if (bodyValue?.length > 0) {
        // yangi rasm larni baza dagi rasm larga qo'shib qo'yiladi
        newUpdates["photos"] = safeParse(dbDataValues["photos"])?.concat(
          bodyValue
        );
      }
    } else {
      // logika shart bo'lmagan field larni shunchaki saqlab ketiladi
      // misol: active: true
      newUpdates[bodyKey] = bodyValue;
    }
  }

  return newUpdates;
}

function combineQuery(queryOfRequest, remainedFilters, fields) {
  if (!fields?.length) return remainedFilters;
  const query = { ...remainedFilters };

  for (const field of fields) {
    if (queryOfRequest[field] !== undefined) {
      query[field] = queryOfRequest[field];
    }
  }

  return query;
}

function configureAttributesOption(queryOfRequest = {}) {
  const { attributes, exclude } = queryOfRequest;
  // const convertedAttributes = attributes.split(",");
  // const convertedExclude = exclude.split(",");

  if (Array.isArray(attributes) && attributes.length > 0) {
    return { attributes };
  }

  if (Array.isArray(exclude) && exclude.length > 0) {
    return { attributes: { exclude } };
  }

  return { attributes: {} };
}

function generateRandomNDigits(n) {
  if (n <= 0) throw new Error("Number of digits must be positive");
  const min = 10 ** (n - 1);
  const max = 10 ** n;
  return crypto.randomInt(min, max);
}

function secondsToWholeMinutes(seconds) {
  return Math.floor(seconds / 60);
}

async function generateUniqueId(
  numberOfDigits,
  model,
  databaseFieldName = "sub_id"
) {
  try {
    let uniqueId;
    let exists = true;

    while (exists) {
      uniqueId = generateRandomNDigits(numberOfDigits);
      const record = await model.findOne({
        where: { [databaseFieldName]: uniqueId },
        attributes: ["id"],
        raw: true,
      });
      if (!record) exists = false;
    }
    return uniqueId;
  } catch (err) {
    console.log(err, "- error on determining Record");
  }
}

function searchByMultipleColumn(
  search,
  columnsList,
  remainedFilters = {},
  language
) {
  if (!search) return remainedFilters;
  const searchRegex = `%${search?.toLowerCase()}%`;

  return {
    [Op.and]: [
      remainedFilters,
      {
        [Op.or]: columnsList.map(({ column, modelName, nested }) => {
          // 2 ta table join bo'lganda 2 lasini ham columni bir xil bo'lsa qaysi table ni column ni search qilishni belgilash uchun kerak bo'ladi misol: title books da bookgenres da ham bo'lsa shunda ambiguity bo'ladi
          const fullColumn = nested
            ? `${modelName}.${column?.trim()}`
            : column?.trim(); // Add table alias!
          return Sequelize.where(
            nested
              ? Sequelize.literal(
                  `LOWER(JSON_UNQUOTE(JSON_EXTRACT(${fullColumn}, '$.${language}')))`
                )
              : undefined,
            {
              [Op.like]: searchRegex,
            }
          );
        }),
      },
      // {
      //   [Op.or]: columnsList.map((col) => ({
      //     [language ? [`${col}.${language}`] : col]: { [Op.like]: searchRegex },
      //   })),
      // },
    ],
  };
}

module.exports = {
  searchQueryObject,
  searchQuery,
  searchBy,
  makeDateFormat,
  searchArrayValue,
  searchDates,
  filterDates,
  basicDateFilter,
  searchQueryMultiple,
  processRecordUpdates,
  combineQuery,
  configureAttributesOption,
  generateRandomNDigits,
  secondsToWholeMinutes,
  generateUniqueId,
  searchByMultipleColumn,
};
