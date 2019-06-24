const mongoose = require("mongoose");

const { isValid } = mongoose.Types.ObjectId;

module.exports = function(req, res, next) {
  const id = req.params.id;

  if (!isValid(id)) return res.status(400).send("Checklist id passed - not valid.");

  next();
};
