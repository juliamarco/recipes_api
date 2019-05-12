const User = require('../models').User;
const SendResponse = require('../pojos/responses');
const response = new SendResponse
pry = require('pryjs');
const bcrypt = require('bcrypt');


const create = (req, res) => {
  if (req.body.email && req.body.password) {
    User.findOne({
      where: { email: req.body.email}
    })
    .then(user => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        response.status200Key(res, user.apiKey)
      }
      else {
        response.status401Invalid(res, "Invalid username or password")
      }
    })
    .catch(error => {
      response.status401Invalid(res, "Invalid username or password")
    })
  }
  else {
    response.status401Invalid(res, "You need to send a password and email")
  }
}


module.exports = { create };
