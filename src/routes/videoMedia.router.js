const router = require("express").Router();
const Controller = require("../controllers/videoMedia.controller");
const authenticate = require("../middlewares/authenticate");
const validator = require("express-joi-validation").createValidator({
  passError: true,
});
const {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
  paginate,
} = require("../validators/videoMedia.validator");
const permit = require("../util/permission");

router.use(authenticate);

const permitCreate = permit("videoMedia", ["create"]);
router
  .route("/")
  .post(permitCreate, validator.body(createSchema), Controller.create);

const permitFind = permit("videoMedia", ["readAll"]);
router.route("/").get(permitFind, validator.query(findAll), Controller.findAll);

router
  .route("/paginate")
  .get(permitFind, validator.query(paginate), Controller.paginate);

const permitOne = permit("videoMedia", ["read"]);
router
  .route("/:id")
  .get(permitOne, validator.params(readSchema), Controller.findOne);

const permitUpdate = permit("videoMedia", ["update"]);
router
  .route("/:id")
  .put(
    permitUpdate,
    validator.params(readSchema),
    validator.body(updateSchema),
    Controller.update
  );

const permitDelete = permit("videoMedia", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.delete);

module.exports = router;
