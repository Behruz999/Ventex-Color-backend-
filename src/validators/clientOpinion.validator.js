const Joi = require("joi");

const createSchema = Joi.object({
  full_name: Joi.object({
    UZL: Joi.string().min(3).required(),
    // UZK: Joi.string().min(3).required(),
    RUS: Joi.string().min(3).required(),
    ENG: Joi.string().min(3).required(),
  }).required(),
  text: Joi.object({
    UZL: Joi.string().min(3).required(),
    // UZK: Joi.string().min(3).required(),
    RUS: Joi.string().min(3).required(),
    ENG: Joi.string().min(3).required(),
  }).required(),
  photo: Joi.string().optional(),
  active: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  id: Joi.number().optional(),
  full_name: Joi.object({
    UZL: Joi.string().min(3).required(),
    // UZK: Joi.string().min(3).required(),
    RUS: Joi.string().min(3).required(),
    ENG: Joi.string().min(3).required(),
  }).optional(),
  text: Joi.object({
    UZL: Joi.string().min(3).required(),
    // UZK: Joi.string().min(3).required(),
    RUS: Joi.string().min(3).required(),
    ENG: Joi.string().min(3).required(),
  }).optional(),
  photo: Joi.string().optional(),
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
  active: Joi.boolean().optional(),
  language: Joi.string().optional(),
});

const paginate = Joi.object({
  limit: Joi.number().integer().required(),
  page: Joi.number().integer().required(),
  attributes: Joi.string().optional(),
  exclude: Joi.string().optional(),
  full_name: Joi.string().optional(),
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
