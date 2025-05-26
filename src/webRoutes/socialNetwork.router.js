const router = require("express").Router();
const Controller = require("../webControllers/socialNetwork.controller");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const {
  readSchema,
  findAll,
  paginate,
} = require("../webValidators/socialNetwork.validator");

router.route("/").get(validator.query(findAll), Controller.findAll);

router.route("/paginate").get(validator.query(paginate), Controller.paginate);

router.route("/:id").get(validator.params(readSchema), Controller.findOne);
module.exports = router;
