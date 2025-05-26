const Joi = require("joi");

const createSchema = Joi.object({
  first_name: Joi.string().min(3).max(100).required(),
  last_name: Joi.string().min(3).max(100).required(),
  phone: Joi.string()
    .length(9)
    .pattern(/^[0-9]+$/)
    .required(),
  role: Joi.string().min(4).max(50).optional(),
  login: Joi.string().optional(),
  password: Joi.string().optional(),
  active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  id: Joi.string().optional(),
  first_name: Joi.string().min(3).max(100).optional(),
  last_name: Joi.string().min(3).max(100).optional(),
  phone: Joi.string()
    .length(9)
    .pattern(/^[0-9]+$/)
    .optional(),
  role: Joi.string().min(4).max(50).optional(),
  login: Joi.string().optional(),
  password: Joi.string().optional(),
  active: Joi.boolean().optional(),
});

const readSchema = Joi.object({
  id: Joi.string().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const findAll = Joi.object({
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  search: Joi.string().optional(),
  phone: Joi.string().optional(),
  role: Joi.string().optional(),
  date: Joi.string().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  limit: Joi.number().integer().min(1).default(10),
  page: Joi.number().integer().min(1).default(1),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  search: Joi.string().optional(),
  phone: Joi.string().optional(),
  role: Joi.string().optional(),
  date: Joi.string().optional(),
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
