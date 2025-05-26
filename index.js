const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "./.env"),
});
const express = require("express");
const cors = require("cors");
const appRouter = require("./src/router");
const winston = require("./src/util/winston.logger");
const morgan = require("morgan");
const sequelize = require("./src/config/db.config");
const { syncModels } = require("./src/models/index");
const helmet = require("helmet");
const { handleError } = require("./src/util/error");
const { readFileDirect } = require("./src/middlewares/readFile");

const app = express();
const env = process.env;
const PORT = env?.PORT || 8000;
const appRoot = process.cwd();

// Ma'lumotlar bazasiga ulanishni tekshirish
(async () => {
  try {
    await sequelize.authenticate();
    await syncModels();
    console.log("Connection has been established successfully");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

app.use(
  cors({
    origin: "*",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse requests of content-type - application/json
app.use(express.json({ limit: "300mb" }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "300mb",
    parameterLimit: 50000,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrcAttr: ["'none'"],
        connectSrc: ["'self'", "https://www.google.com"],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://www.google.com",
          "https://www.gstatic.com",
        ],
        frameSrc: [
          "'self'",
          "https:",
          "data:",
          "https://www.google.com",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        upgradeInsecureRequests: [],
        workerSrc: ["'self'", "blob:"],
      },
    },
    frameguard: { action: "deny" },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true,
  })
);

// middleware to log each request
app.use(morgan("combined", { stream: winston.stream }));

// api routes
app.use("/api", appRouter);

const UPLOAD_FOLDER_NAME = env?.UPLOAD_FOLDER_NAME;

const imageRes = path.join(appRoot, env?.FILEPATH, UPLOAD_FOLDER_NAME);
const allowedExtensions = env?.ALLOWED_EXTENSIONS.split(",").map((ext) =>
  ext?.trim()
);

const expressStaticOptions = {
  dotfiles: "deny",
  index: false,
  fallthrough: false,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      res.status(403).json({
        message: "Forbidden",
        reason: "This file type is not allowed",
      });
      return;
    }
  },
};

app.use("/files", express.static(imageRes, expressStaticOptions));

app.get("/files/:folder/:format/:img", (req, res, next) => {
  readFileDirect(req, res);
});

const root = path.join(appRoot, "./public");

app.use(express.static(root));
app.get("/*", (req, res, next) => {
  res.sendFile("index.html", { root });
});

// error handler
app.use((err, req, res, next) => {
  handleError(err, req, res);
});

// set port, listen for requests
app.listen(PORT, () => {
  console.log(`Server's running on port \x1b[33m${PORT}\x1b[0m`);
});

module.exports = app;
module.exports = sequelize;
