//user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  token: String,
  birthday: Date
}, {collection: 'users'});

module.exports = mongoose.model('User', UserSchema);
