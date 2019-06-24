const mongoose=require('mongoose');
const config = require('config')
const Joi = require('@hapi/joi');


const joi_item_schema = Joi.object().keys({
    name: Joi.string().max(120).required(),
    description: Joi.string(),
    colorHex: Joi.string().regex(/^#[A-Za-z0-9]{6,6}$/),
    checked: Joi.boolean()

})

const itemSchema = mongoose.Schema({
    name: {
      type: String,
      maxLength: 120,
      required: true
    },
    description: {
        type: String
    },
    colorHex: {
      type: String,
      validate: {
        validator: function(n) {
          return /^#[A-Za-z0-9]{6,6}$/.test(n);
        },
        message: "A color hex code  must contain a # with 6 following characters."
      },
      lowercase: true,
      required: true,
      default: config.get("ITEM_DEFAULT_COLOR")
        ? config.get("ITEM_DEFAULT_COLOR")
        : "#ffffff" //If an env variable for a default color exists - chooses that color, if not - white.
    },
    checked: {
        type: Boolean,
        required: true,
        default: false
    }
  });


  module.exports.item_joiSchema = joi_item_schema;
  module.exports.item_mongooseSchema= itemSchema;