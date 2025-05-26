const router = require("express").Router();
const Controller = require("../controllers/admin.controller");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const { adminValidator } = require("../validators/admin.validator");

router
  .route("/auth")
  .post(validator.body(adminValidator), Controller.adminAuth);

module.exports = router;
