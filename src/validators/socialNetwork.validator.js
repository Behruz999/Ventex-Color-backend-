const Joi = require("joi");

const createSchema = Joi.object({
  telegram: Joi.string().optional(),
  instagram: Joi.string().optional(),
  facebook: Joi.string().optional(),
  youtube: Joi.string().optional(),
  active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  id: Joi.number().optional(),
  telegram: Joi.string().optional(),
  instagram: Joi.string().optional(),
  facebook: Joi.string().optional(),
  youtube: Joi.string().optional(),
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
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  limit: Joi.number().integer().required(),
  page: Joi.number().integer().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
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
