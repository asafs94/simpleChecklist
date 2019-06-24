const app = require('express')();
const checklists = require('./routes/checklists');
const users = require('./routes/users');
const mongoose = require('mongoose');
const config = require('config');
const Joi = require('@hapi/joi');
const bodyParser = require('body-parser');
Joi.objectid= require("joi-objectid")(Joi);


app.use(bodyParser.json());
app.use("/api/checklists",checklists)
app.use("/api/users",users)

//DATABASE
const dbURI = config.get('DB_URI');
let db;

function initializeDB() {
  db = mongoose.connect(dbURI, { useNewUrlParser: true }, () => {
  }); 
}
initializeDB();

//SERVER
const port = process.env.PORT || 3000;
//Starting server

const server =app.listen(port, (req, resp) => {
  console.log(`Listening on port ${port}`)
});



module.exports = server;
