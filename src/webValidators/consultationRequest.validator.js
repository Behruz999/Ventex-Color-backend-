const Joi = require("joi");

const createSchema = Joi.object({
  full_name: Joi.string().required(),
  phone: Joi.string().required(),
  text: Joi.string().required(),
  active: Joi.boolean().optional(),
});

module.exports = { createSchema };
