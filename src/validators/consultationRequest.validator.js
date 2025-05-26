const Joi = require("joi");

const updateSchema = Joi.object({
  id: Joi.number().optional(),
  full_name: Joi.string().optional(),
  phone: Joi.string().optional(),
  text: Joi.string().optional(),
  date: Joi.string().optional(),
  status: Joi.number().optional(),
  active: Joi.boolean().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  language: Joi.string().optional(),
});

const findAll = Joi.object({
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  full_name: Joi.string().optional(),
  date: Joi.string().optional(),
  status: Joi.number().optional(),
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  limit: Joi.number().integer().required(),
  page: Joi.number().integer().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  full_name: Joi.string().optional(),
  date: Joi.string().optional(),
  status: Joi.number().optional(),
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

module.exports = {
  updateSchema,
  deleteSchema,
  readSchema,
  findAll,
  paginate,
};
