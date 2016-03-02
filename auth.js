const client = require('./redisFunctions.js').client;
const bcrypt = require('bcrypt');

const getUserPassword = (username, callback) => {
	client.HGET('admins', username, (err, password) => {
		if(err) {
			return callback('cannot find username');
		} else {
			return callback(password);
		}
	});
};

const validate = (request, username, actualPassword, callback) => {
	getUserPassword(username, (DBpassword) => {
		bcrypt.compare(actualPassword, DBpassword, (err, isValid) => {
			return callback(err, isValid, {'username': username});
		});
	});
};

module.exports = {
	validate: validate,
	getUserPassword: getUserPassword,
	client: client
};