const fs = require("fs");
const path = require("path");
const {
  safeParse,
  isAllItemsString,
  isAllItemsObject,
  isObject,
  isArray,
} = require("./translate");
const appRoot = process.cwd();
const UPLOAD_FOLDER_NAME = process.env?.UPLOAD_FOLDER_NAME;

// Assuming you have a file path stored in a variable
module.exports = {
  // update yoki delete api lar uchun fayl va rasmlarni o'chirish uchun funksiya
  removeFile: async function (document, fields) {
    try {
      const doc = document?.dataValues || document;
      for (const key of Object.keys(doc)) {
        // 1 ta rasm (fayl)ning url ni aniqlab, o'chirib yuborish
        if (
          (key === "photo" ||
            key === "file" ||
            key === "logo" ||
            key === "path") &&
          fields.includes(key)
        ) {
          const filePath = doc[key];
          filePath && (await module.exports.deleteFile(filePath));
        }

        // 1 tadan ortiq rasmlarni o'zida saqlovchi array column larning url larini va fayl (rasm)larini o'chirib tashlash
        if (key === "photos" && fields.includes(key)) {
          const parsedPhotos = safeParse(doc[key]); // dokumentning array column ni pars qilinadi, chunki bazada string ga aylantirib saqlanadi
          if (parsedPhotos?.length > 0) {
            try {
              await Promise.all(
                parsedPhotos.map((url) => module.exports.deleteFile(url))
              );
            } catch (err) {
              if (err.code !== "ENOENT") {
                throw new Error(`Error deleting files: ${err?.message || err}`);
              } else {
                console.log(err?.message || err, "- error on unlinking file");
              }
            }
          }
        }
      }
      return true; // rasm (yoki fayl) muvaffaqiyatli o'chirilsa, true qaytarish
    } catch (err) {
      console.log(err, '- error on removing "File"');
      return false;
    }
  },

  /**
   * Delete a single file - this method should be implemented elsewhere
   * @param {string} filePath - Path to the file
   * @returns {Boolean}
   */
  deleteFile: async function (filePath) {
    // const filePathParts = new URL(filePath).pathname.split("/");
    const filePathOrg = path.join(
      appRoot,
      process.env?.FILEPATH,
      UPLOAD_FOLDER_NAME,
      filePath
      // ...filePathParts.slice(-3)
    ); // rasm (yoki faylni) to'liq qayerda joylashganligini yo'nalishini aniqlash
    try {
      await fs.promises.unlink(filePathOrg); // o'chirish
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("File does not exist: " + error, filePath);
      } else {
        console.error("Error deleting file:", error);
      }
      return false; // this was not defined before (added for test)
    }
  },

  /**
   * Rollback file uploads when error occurs during API process
   * @param {Object|Array} requestBody - The request body containing file paths
   * @returns {Promise<boolean>} - Success status of rollback operation
   */
  rollbackFileUploads: async function (requestBody) {
    const singularFields = ["photo", "path", "logo"];
    const pluralFields = ["photos"];
    try {
      await processDeletionOfFiles(requestBody, singularFields, pluralFields);
      return true;
    } catch (err) {
      console.error("Error during rollback file upload(s):", err);
      return false;
    }
  },
};

/**
 * Process deletion of files based on type of data
 * @param {Object|Array} requestBody - Request body containing file paths
 * @param {Array<string>} singularFields - Field names for single files
 * @param {Array<string>} pluralFields - Field names for file arrays
 * @returns {Promise<void>}
 */
async function processDeletionOfFiles(
  requestBody,
  singularFields,
  pluralFields
) {
  if (!requestBody) return;

  if (isObject(requestBody)) {
    await processObjectFileDeletion(requestBody, singularFields, pluralFields);
  } else if (isArray(requestBody)) {
    await processArrayFileDeletion(requestBody, singularFields, pluralFields);
  }
}

/**
 * Process file deletion for object type data
 * @param {Object} requestBody - Object containing file fields
 * @param {Array<string>} singularFields - Field names for single files
 * @param {Array<string>} pluralFields - Field names for file arrays
 * @returns {Promise<void>}
 */
async function processObjectFileDeletion(
  requestBody,
  singularFields,
  pluralFields
) {
  const promises = [];

  for (const field of Object.keys(requestBody)) {
    const fieldValue = requestBody[field];
    if (!fieldValue) continue;

    // Handle singular fields (single file/image deletion)
    if (typeof fieldValue === "string" && singularFields.includes(field)) {
      promises.push(module.exports.deleteFile(fieldValue));
    }

    // Handle plural fields (multiple files/images deletion)
    if (
      isArray(fieldValue) &&
      fieldValue.length > 0 &&
      pluralFields.includes(field)
    ) {
      if (isAllItemsString(fieldValue)) {
        // If array contains only string paths
        promises.push(
          ...fieldValue.map((filePath) => module.exports.deleteFile(filePath))
        );
      } else if (isAllItemsObject(fieldValue)) {
        // If array contains objects
        for (const object of fieldValue) {
          const nestedFields = [...singularFields, ...pluralFields];
          for (const nestedField of nestedFields) {
            if (typeof object[nestedField] === "string") {
              promises.push(module.exports.deleteFile(object[nestedField]));
            } else if (isArray(object[nestedField])) {
              promises.push(
                processDeletionOfFiles(
                  object[nestedField],
                  singularFields,
                  pluralFields
                )
              );
            }
          }
        }
      }
    }

    // Recursively process nested objects
    if (
      isObject(fieldValue) &&
      !singularFields.includes(field) &&
      !pluralFields.includes(field)
    ) {
      promises.push(
        processDeletionOfFiles(fieldValue, singularFields, pluralFields)
      );
    }
  }

  await Promise.all(promises);
}

/**
 * Process file deletion for array type data
 * @param {Array} requestBody - Array containing file data
 * @param {Array<string>} singularFields - Field names for single files
 * @param {Array<string>} pluralFields - Field names for file arrays
 * @returns {Promise<void>}
 */
async function processArrayFileDeletion(
  requestBody,
  singularFields,
  pluralFields
) {
  const promises = [];

  if (isAllItemsString(requestBody)) {
    // If array contains only strings (file paths)
    promises.push(
      ...requestBody.map((filePath) => module.exports.deleteFile(filePath))
    );
  } else if (isAllItemsObject(requestBody)) {
    // If array contains objects
    for (const object of requestBody) {
      const nestedFields = [...singularFields, ...pluralFields];
      for (const field of nestedFields) {
        if (typeof object[field] === "string") {
          promises.push(module.exports.deleteFile(object[field]));
        } else if (isArray(object[field])) {
          promises.push(
            processDeletionOfFiles(object[field], singularFields, pluralFields)
          );
        }
      }

      // Process other fields that might contain nested objects
      for (const field of Object.keys(object)) {
        if (!nestedFields.includes(field) && isObject(object[field])) {
          promises.push(
            processDeletionOfFiles(object[field], singularFields, pluralFields)
          );
        }
      }
    }
  }

  await Promise.all(promises);
}
