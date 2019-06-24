const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const config = require("config");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    minlength: 3,
    maxlength: 12,
    required: true
  },
  lastName: {
    type: String,
    minlength: 3,
    maxlength: 12
  },
  password: {
    type: String,
    minlength: 3,
    maxlength: 255,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    regex: /^[A-Za-z0-9.-_]{3,}[@][A-Za-z0-9.-_]{3,}[.][A-Za-z0-9.-_]{1,}$/
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const jwtPvtKey= config.get("JWT_PRIVATE_KEY");
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin, email: this.email },
    jwtPvtKey
  );
  return token;
};

const User = mongoose.model("user", userSchema);

function validateUser(user) {
  const validUser = Joi.object().keys({
    firstName: Joi.string()
      .alphanum()
      .min(3)
      .max(12)
      .required()
      .regex(/^([A-Za-z]*)$/),
    lastName: Joi.string()
      .alphanum()
      .min(3)
      .max(12)
      .regex(/^([A-Za-z]*)$/),
    email: Joi.string()
      .min(3)
      .email()
      .required(),
    password: Joi.string()
      .min(3)
      .max(15)
      .required()
  });

  return Joi.validate(user, validUser);
}

module.exports.User = User;
module.exports.validator = validateUser;
