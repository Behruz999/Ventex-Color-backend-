const Joi = require("joi");

const userAuthValidator = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { userAuthValidator };
