const router = require("express").Router();
const Controller = require("../controllers/service.controller");
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
} = require("../validators/service.validator");
const permit = require("../util/permission");
const { uploadFiles } = require("../util/uploadFile");

router.use(authenticate);

const permitCreate = permit("service", ["create"]);
router
  .route("/")
  .post(
    permitCreate,
    uploadFiles,
    validator.body(createSchema),
    Controller.create
  );

const permitFind = permit("service", ["readAll"]);
router.route("/").get(permitFind, validator.query(findAll), Controller.findAll);

router
  .route("/paginate")
  .get(permitFind, validator.query(paginate), Controller.paginate);

const permitOne = permit("service", ["read"]);
router
  .route("/:id")
  .get(permitOne, validator.params(readSchema), Controller.findOne);

const permitUpdate = permit("service", ["update"]);
router
  .route("/:id")
  .put(
    permitUpdate,
    uploadFiles,
    validator.params(readSchema),
    validator.body(updateSchema),
    Controller.update
  );

const permitDelete = permit("service", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.delete);

module.exports = router;
