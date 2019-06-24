const { User, validator } = require("../models/user");
const router = require("express").Router();
const validate = require("../middleware/validate");
const _ = require("lodash");
const hashPassowrd = require("../middleware/password-hashing");

router.post("/", validate(validator), async (req, res) => {
  
  const userInDb = await User.findOne({ email: req.body.email });
  if (userInDb) res.status(400).send("A user with that email already exists.");

  
  //Create a user object:
  const user = new User(
    _.pick(req.body, ["email", "password", "firstName", "lastName"])
  );

  //hash password:
  user.password = await hashPassowrd(user.password);
  try{
  await user.save();
  }
  catch(err){
    console.log("An error occured:" , err);
  }
  return res.send();
});

module.exports = router;
