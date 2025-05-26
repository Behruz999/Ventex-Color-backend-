const winston = require("./winston.logger");
const expressValidation = require("express-validation");
const fs = require("fs");
const path = require("path");
const { rollbackFileUploads } = require("../util/deleteFile");

class ErrorHandler extends Error {
  constructor(statusCode, message, fullError, code = null, options = {}) {
    super();
    this.statusCode = statusCode;
    this.fullError = fullError;
    this.message = message;
    this.code = code;
    this.options = options; // bu parametrda obyekt ichida xohlagan narsani jo'natsa bo'ladi (dynamic), natijada error ni sababini to'liq korib bo'ladi, ayniqsa tashqi server yoki resurslar bilan ishlaganda
  }
}

const handleError = async (err, req, res) => {
  await rollbackFileUploads(req.body);

  if (err?.error && err?.error?.isJoi) {
    err.message = err?.error && err?.error?.toString();
    err.statusCode = 400;
  }

  if (err instanceof expressValidation.ValidationError) {
    const unifiedErrorMessage = err?.errors
      ?.map((error) => error?.messages?.join("."))
      ?.join("and");
    err.message = unifiedErrorMessage;
    err.statusCode = 400;
  }

  let { statusCode, message, fullError, code, options } = err;

  let logMessage =
    `errorStatus: ${statusCode || 500}` + ` — errorMessage: ${message}`;

  if (fullError) {
    logMessage += ` — fullError: ${fullError}`;
  }

  if (options && Object?.keys(options)?.length > 0) {
    logMessage += ` — options: ${JSON?.stringify(options)}`;
  }

  if (err?.stack) {
    logMessage += ` — errorStack: ${err.stack}`;
  }

  winston.error(logMessage);

  switch (fullError?.parent?.errno) {
    case 1452:
      // if user provided id that doesn't exist on second (reference) table
      fullError.message = `Invalid reference ID provided! Please verify the ID exists in the system and try again`;
      break;
    case 1451:
      // when trying to delete a record that is still referenced by other records
      fullError.message = `Cannot delete this item because it is still in use. Please remove related items first and try again`;
      break;
    case 1062:
      fullError.message = `Duplicate entry`;
      break;
    default:
      break;
  }

  const responseSchema = { status: "Error" };

  if (statusCode) responseSchema["statusCode"] = statusCode;
  if (code) responseSchema["code"] = code;
  if (message) responseSchema["message"] = message;
  if (fullError) responseSchema["reason"] = fullError?.message || fullError;

  res.status(statusCode || 500).json(responseSchema);
};

// this function created for debugging
async function logBug(name, data) {
  const formattedDate = new Intl.DateTimeFormat("sv-SE", {
    // 2024-11-20 15:30
    dateStyle: "short",
    timeStyle: "short",
  })
    .format(new Date())
    .replace("T", " ");

  const logFilePath = path.join(__dirname, "../../");

  const log = `${name}: ${
    typeof data === "object" ? JSON.stringify(data, null, 2) : data
  } <${formattedDate}\n`;
  try {
    await fs.promises.appendFile(`${logFilePath}/errors.log`, log);
  } catch (err) {
    console.error("Error writing to log file:", err);
  }
}

module.exports = {
  ErrorHandler,
  handleError,
  logBug,
};
