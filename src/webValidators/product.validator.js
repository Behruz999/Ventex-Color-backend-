const Joi = require("joi");

const readSchema = Joi.object({
  id: Joi.string().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  language: Joi.string().optional(),
});

const findAll = Joi.object({
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  category_id: Joi.number().optional(),
  coating_id: Joi.number().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  page: Joi.number().integer().required(),
  limit: Joi.number().integer().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  category_id: Joi.number().optional(),
  coating_id: Joi.number().optional(),
  language: Joi.string().optional(),
});

module.exports = {
  readSchema,
  findAll,
  paginate,
};
