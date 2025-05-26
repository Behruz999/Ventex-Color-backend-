const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

async function transformData(data, language, options = { translate: true }) {
  return await processTransformation(data, language, options);
}

async function processTransformation(data, language, options) {
  if (!data) return data;
  if (isObject(data)) {
    return await processObjectTransform(data, language, options);
  } else if (isArray(data)) {
    return await processArrayTransform(data, language, options);
  }
}

async function processObjectTransform(data, language, options) {
  const transformed = { ...(data?.dataValues || data) };
  for (const [key, value] of Object.entries(transformed)) {
    if (value?.dataValues) {
      transformed[key] = value.dataValues;
    }
    if (isStringifiedJSON(value)) {
      transformed[key] = parseField(value);
      if (
        isObject(transformed[key]) &&
        options.translate &&
        language in transformed[key]
      ) {
        transformed[key] = transformed[key][language];
      } else if (isArray(transformed[key])) {
        transformed[key] = await processArrayTransform(
          transformed[key],
          language,
          options
        );
      }
    } else if (isObject(value)) {
      for (const [key1, value1] of Object.entries(transformed[key]) || {}) {
        if (isStringifiedJSON(value1)) {
          transformed[key][key1] = parseField(value1);
          if (
            isObject(transformed[key][key1]) &&
            options.translate &&
            language in transformed[key][key1]
          ) {
            transformed[key][key1] = transformed[key][key1][language];
          }
        } else if (isObject(value1)) {
          transformed[key][key1] = await processObjectTransform(
            transformed[key][key1],
            language,
            options
          );
        } else if (isArray(value1)) {
          transformed[key][key1] = await processArrayTransform(
            transformed[key][key1],
            language,
            options
          );
        }
      }
    } else if (isArray(value)) {
      transformed[key] = await processArrayTransform(value, language, options);
    }
  }
  return transformed;
}

async function processArrayTransform(data, language, options) {
  const transformed = data?.dataValues || data;
  for (let i = 0; i < transformed.length; i++) {
    const formatted = transformed[i]?.dataValues || transformed[i];
    if (isObject(formatted)) {
      transformed[i] = await processObjectTransform(
        formatted,
        language,
        options
      );
    } else if (isArray(formatted)) {
      transformed[i] = await processTransformation(
        formatted,
        language,
        options
      );
    }
  }
  return transformed;
}

const parseField = (value) => {
  if (typeof value === "string") {
    return safeParse(value);
  }
  return value;
};

const isStringifiedJSON = (value) =>
  typeof value === "string" &&
  (() => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  })();

const isArray = (value) => Array.isArray(value) && typeof value === "object";

const isObject = (value) =>
  !Array.isArray(value) && value !== null && typeof value === "object";

const isAllItemsString = (array) =>
  array?.every((item) => typeof item === "string");

const isAllItemsObject = (array) =>
  array?.every(
    (item) => typeof item === "object" && !Array.isArray(item) && item !== null
  );

module.exports = {
  transformData,
  safeParse,
  isArray,
  isObject,
  isAllItemsString,
  isAllItemsObject,
};
