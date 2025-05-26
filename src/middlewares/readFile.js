const path = require("path");
const fs = require("fs");
const env = process.env;
const appRoot = process.cwd();
const UPLOAD_FOLDER_NAME = env?.UPLOAD_FOLDER_NAME;

function readFileDirect(req, res) {
  const imageName = `${req.params.folder}/${req.params.format}/${req.params.img}`;
  const imagePath = path.join(
    appRoot,
    env?.FILEPATH,
    UPLOAD_FOLDER_NAME,
    imageName
  );

  fs.readFile(imagePath, (err, data) => {
    if (err) {
      return res.status(404).json({ message: "Image not found" });
    }
    const extension = path.extname(imagePath).toLowerCase();

    let contentType;
    switch (extension) {
      case ".jpg":
      case ".jpeg":
      case ".png":
        contentType = "image/jpeg";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".doc":
        contentType = "application/msword";
        break;
      case ".docx":
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".xls":
        contentType = "application/vnd.ms-excel";
        break;
      case ".xlsx":
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
      case ".ppt":
        contentType = "application/vnd.ms-powerpoint";
        break;
      case ".pptx":
        contentType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        break;
      case ".txt":
        contentType = "text/plain";
        break;
      case ".rtf":
        contentType = "application/rtf";
        break;
      case ".zip":
        contentType = "application/zip";
        break;
      case ".rar":
        contentType = "application/x-rar-compressed";
        break;
      case ".tar":
        contentType = "application/x-tar";
        break;
      case ".7z":
        contentType = "application/x-7z-compressed";
        break;
      default:
        contentType = "application/octet-stream";
        break;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

module.exports = { readFileDirect };
