const router = require("express").Router();
const Controller = require("../controllers/product.controller");
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
} = require("../validators/product.validator");
const permit = require("../util/permission");

router.use(authenticate);
const permitCreate = permit("product", ["create"]);
router
  .route("/")
  .post(permitCreate, validator.body(createSchema), Controller.create);

const permitFind = permit("product", ["readAll"]);
router.route("/").get(permitFind, validator.query(findAll), Controller.findAll);

router
  .route("/paginate")
  .get(permitFind, validator.query(paginate), Controller.paginate);

const permitOne = permit("product", ["read"]);
router
  .route("/:id")
  .get(permitOne, validator.params(readSchema), Controller.findOne);

const permitUpdate = permit("product", ["update"]);
router
  .route("/:id")
  .put(
    permitUpdate,
    validator.params(readSchema),
    validator.body(updateSchema),
    Controller.update
  );

const permitDelete = permit("product", ["delete"]);
router
  .route("/:id")
  .delete(permitDelete, validator.params(deleteSchema), Controller.delete);

module.exports = router;
