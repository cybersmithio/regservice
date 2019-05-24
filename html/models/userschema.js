var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    domain: String,     //i.e. "local", "google", "facebook", etc
    username: String,
    screenname: String,
	password: String,
	email: String,
	role: String,
	created: Date,
},{ collection: "users"});
var User = mongoose.model('User', userSchema);
module.exports = User;
