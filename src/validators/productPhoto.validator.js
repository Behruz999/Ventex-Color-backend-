const Joi = require("joi");

const createSchema = Joi.object({
  product_id: Joi.number().required(),
  coating_id: Joi.number().required(),
  photos: Joi.array().items(Joi.string().optional()).optional(),
  active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  id: Joi.number().optional(),
  product_id: Joi.number().optional(),
  coating_id: Joi.number().optional(),
  photos: Joi.array().items(Joi.string().optional()).optional(),
  basket: Joi.array().optional(),
  active: Joi.boolean().optional(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  language: Joi.string().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  product_id: Joi.number().optional(),
  coating_id: Joi.number().optional(),
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  page: Joi.number().integer().required(),
  limit: Joi.number().integer().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  product_id: Joi.number().optional(),
  coating_id: Joi.number().optional(),
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

module.exports = {
  createSchema,
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
  paginate,
};
