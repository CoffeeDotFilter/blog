const client = require('./redisFunctions.js').client;
const bcrypt = require('bcrypt');
const env = require('env2')('./config.env');

const validate = (request, username, actualPassword, callback) => {
	bcrypt.compare(actualPassword, process.env[username.toLowerCase()], (err, isValid) => {
		return callback(err, isValid, {'username': username});
	});
};

module.exports = {
	validate: validate,
	client: client
};