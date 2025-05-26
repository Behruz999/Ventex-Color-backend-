const router = require("express").Router();
const Controller = require("../controllers/telegramFile");
const { uploadFiles } = require("../util/uploadFile");

// for telegram bot
router.route("/").post(uploadFiles, Controller.telegramFileUpload);

router.route("/news").post(Controller.createByTelegramBot);

router.route("/news/:id").put(Controller.updateByTelegramBot);

module.exports = router;
