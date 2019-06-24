const jwt = require("jsonwebtoken");
const config= require('config');

const validateToken = (req, resp, next) => {
  let token = req.header("x-auth-token");
  if (!token) resp.status(401).send("Unauthorized!");

  try {
    const decoded = jwt.verify(token, config.get("JWT_PRIVATE_KEY"));
    req.user = decoded;
    next();
  } catch (ex) {
    return resp.status(400).send("Invalid Token");
  }
};

const isAdmin = (req, resp, next) => {
  if (!req.user.isAdmin) {
    resp.status(403).send("Forbidden Access");
  } else {
    next();
  }
};

module.exports.auth = validateToken;
module.exports.admin = isAdmin;
