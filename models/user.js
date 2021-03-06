const bcrypt = require('bcrypt');
const invalidMessage = 'Invalid username or password'
const invalidKey = 'Invalid API key'
const SendResponse = require('../pojos/responses');
const response = new SendResponse
const mailTaken = 'Email has been taken'
const uuidv4 = require('uuid/v4')


'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    apiKey: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    User.hasMany(models.UserRecipe);
    User.belongsToMany(models.Recipe, {through: models.UserRecipe});
  };

  User.findUserEmail = function(email){
    return new Promise(function(resolve, reject) {
      User.findOne({ where: { email: email } })
    .then(user =>{ resolve(user) })
    .catch((error) => { reject(invalidMessage)} )
    })
  };

  User.findUserApiKey = function(apiKey){
    return new Promise(function(resolve, reject) {
      User.findOne({ where: { apiKey: apiKey } })
    .then(user =>{
      user === null ? response.statusMessage(res, 401, invalidKey) : resolve(user)
    })
    .catch((error) => { reject(invalidMessage)} )
    })
  };

  User.prototype.checkPassword = function(password){
    return bcrypt.compareSync(password, this.password);
  };

  User.login = function(email, password, res) {
    if (email && password) {
      return new Promise(function(resolve, reject) {
        User.findUserEmail(email)
        .then(user => {
          user.checkPassword(password) ? resolve(user) : reject(response.statusMessage(res, 401, invalidMessage));
        })
        .catch(error => {
          response.statusMessage(res, 401, invalidMessage);
        });
      });
    }
    else {
      response.statusMessage(res, 401, 'You need to send a password and email');
    }
  }

  User.creation = function(password, res, email){
    var pass = bcrypt.hashSync(password, 10)
    user = User.create({
      email: email,
      password: pass,
      apiKey: uuidv4()
    })
    return user
  }

  User.registration = function(password, password_confirmation, res, email){
    return new Promise(function(resolve, reject){
      if (password != password_confirmation) {
        response.statusMessage(res, 400, 'Passwords do not match')
      }
      else {
        return User.findUserEmail(email)
        .then(user => {
          user ? reject(mailTaken) : resolve(User.creation(password, res, email));
        })
        .catch(error => {
          response.statusMessage(res, 401, 'You need to send a password and email');
        });
      }
    });
  };
  return User;
};
