const router = require("express").Router();
const Controller = require("../webControllers/consultationRequest.controller");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const {
  createSchema,
} = require("../webValidators/consultationRequest.validator");

router.route("/").post(validator.body(createSchema), Controller.create);

module.exports = router;
