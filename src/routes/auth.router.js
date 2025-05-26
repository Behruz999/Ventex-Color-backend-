const router = require("express").Router();
const Controller = require("../controllers/admin.controller");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});

const { userAuthValidator } = require("../validators/auth.validator");

router
  .route("/users")
  .post(validator.body(userAuthValidator), Controller.userAuth);

module.exports = router;
