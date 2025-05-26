const router = require("express").Router();
const Controller = require("../controllers/deleteFile.controller");
const authenticate = require("../middlewares/authenticate");
const permit = require("../util/permission");

router.use(authenticate);

const permitDelete = permit("deleteFile", ["delete"]);
router.route("/").delete(permitDelete, Controller.deleteFile);

module.exports = router;
