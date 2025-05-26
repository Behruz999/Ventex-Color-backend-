const multer = require("multer");
const fs = require("fs");
const path = require("path");
const env = process.env;

const fileCategories = {
  image: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/bmp",
    "image/heic",
    "image/webp",
  ],
  video: [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-flv",
    "video/x-matroska",
  ],
  audio: [
    "audio/mpeg",
    "audio/ogg",
    "audio/midi",
    "audio/x-wav",
    "audio/3gpp",
    "audio/webm",
  ],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/rtf",
    "application/zip",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/x-7z-compressed",
  ],
};

// Map for fast MIME type lookup
const fileCategoriesMap = new Map([
  ...fileCategories.image.map((type) => [type, "images"]),
  ...fileCategories.video.map((type) => [type, "videos"]),
  ...fileCategories.audio.map((type) => [type, "audio"]),
  ...fileCategories.document.map((type) => [type, "documents"]),
]);

// Function to get category based on MIME type
const getCategory = (mimetype) => fileCategoriesMap.get(mimetype) || "others";

// Function to get file bytes based on input
const getFileSizeInBytes = (mb = 500) => mb * 1024 * 1024;

// Async directory creation function
const createDirectoryIfNotExists = async (dir) => {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error("Error creating directory:", err);
  }
};

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    // Extract urlName here and store in req object for later access
    const url_name = req.originalUrl.split("/")[2].split("?")[0] || "files";
    req.urlName =
      url_name === "web"
        ? req.originalUrl.split("/")[3].split("?")[0]
        : url_name;
    const category = getCategory(file.mimetype);
    let urlName;
    switch (req?.urlName) {
      case "tg":
        urlName = "news";
        break;
      case "web":
        urlName = req.originalUrl.split("/")[3].split("?")[0];
        break;
      default:
        urlName = req?.urlName;
        break;
    }
    const basePath = path.join(
      process.env.FILEPATH,
      process.env?.UPLOAD_FOLDER_NAME || "uploads",
      urlName,
      category
    );
    await createDirectoryIfNotExists(basePath);
    callback(null, basePath);
  },

  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `file-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  const supportedFilesSet = new Set([
    ...fileCategories.image,
    ...fileCategories.video,
    ...fileCategories.audio,
    ...fileCategories.document,
  ]);

  if (supportedFilesSet.has(file.mimetype)) {
    return callback(null, true);
  } else {
    console.error(`Unsupported file format: ${file.mimetype}`);
    return callback(new Error("Unsupported file format"), false);
  }
};

const MAX_FILE_SIZE = getFileSizeInBytes(env?.MAX_FILE_SIZE_MB); // default: 500 MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: "files", maxCount: 6 },
  { name: "file", maxCount: 1 },
  { name: "doc", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

// Function to generate the file URL path
const getFilePath = (file, req) => {
  const category = getCategory(file.mimetype);
  const urlName = req.urlName === "tg" ? "news" : req.urlName;
  return `${urlName || "files"}/${category}/${file.filename}`;
};

// Dynamic file fields handler
const handleFileFields = (req) => {
  // Handle multiple files
  if (req.files?.files) {
    const photos = ["news", "product-photos"];
    if (photos.includes(req.urlName)) {
      req.body.photos = req.files.files.map((file) => getFilePath(file, req));
    }
  }

  // Handle single file
  if (req.files?.file) {
    const path = ["file-metadatas"];
    const photo = [
      "abouts",
      "client-opinions",
      "coatings",
      "contacts",
      "our-partners",
      "photo-medias",
      "product-categories",
      "services",
      "sliders",
    ];

    if (req.urlName === "tg" || photo.includes(req.urlName)) {
      req.body.photo = getFilePath(req.files.file[0], req);
    }
    if (path.includes(req.urlName)) {
      req.body.path = getFilePath(req.files.file[0], req);
    }
  }

  // Handle single file (logotip)
  if (req.files?.logo) {
    const logo = ["contacts"];

    if (logo.includes(req.urlName)) {
      req.body.logo = getFilePath(req.files.logo[0], req);
    }
  }

  // Handle specific document file types (e.g., PDF, DOCX)
  if (req.files?.doc) {
    const file = [];
    if (file.includes(req.urlName)) {
      req.body.file = getFilePath(req.files.doc[0], req);
    }
  }
};

exports.uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: "Failed to upload file(s)",
        reason: err?.message || err,
      });
    }
    // Handle file fields dynamically
    if (req.files) {
      handleFileFields(req);
    }
    next();
  });
};
