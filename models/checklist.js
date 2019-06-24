const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const config = require("config");
const { item_joiSchema, item_mongooseSchema } = require("./sub-schemas/item");

//Defining the mongoose schema for a checklist:
const checklistSchema = mongoose.Schema({
  name: {
    type: String,
    maxLength: 50,
    minLength: 3,
    required: true
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
    default: config.get("LIST_DEFAULT_COLOR")
      ? config.get("LIST_DEFAULT_COLOR")
      : "#ffffff" //If an env variable for a default color exists - chooses that color, if not - white.
  },
  items: {
    type: [item_mongooseSchema]
  },
  user: {
    type: new mongoose.Schema({
      email: {
        type: String,
        required: true,
        regex: /^[A-Za-z0-9.-_]{3,}[@][A-Za-z0-9.-_]{3,}[.][A-Za-z0-9.-_]{1,}$/
      }
    }),
    required: true
  }
});

//static methods:
checklistSchema.statics.getUserChecklists = function(userId) {
  return this.find({
    "user._id": userId
  });
};

checklistSchema.statics.getUserChecklist = function(userId, checklistId) {
  return this.findOne({
    _id: checklistId,
    "user._id": userId
  });
};

// methods

checklistSchema.methods.updateTo = async function(updatedChecklist) {
  //loop on all updated checklist keys
  //make keys of this checklist that exist on updated checklist be the same

  updatedChecklist = new Checklist(updatedChecklist);

  const { name, colorHex, items } = updatedChecklist;

  this.name = name;
  this.colorHex = colorHex;
  this.items = items;

  return this.save();
};

//Model init:
const Checklist = mongoose.model("Checklist", checklistSchema);

//A Joi validation function for a schema:
const validateChecklist = function(checklist) {
  const schema = Joi.object().keys({
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    colorHex: Joi.string().regex(/^#[A-Za-z0-9]{6,6}$/),
    items: Joi.array().items(item_joiSchema),
    user: Joi.object().keys({
      email: Joi.string()
        .min(3)
        .email()
        .required()
    })
  });

  return Joi.validate(checklist, schema);
};

module.exports.Checklist = Checklist;
module.exports.validator = validateChecklist;
