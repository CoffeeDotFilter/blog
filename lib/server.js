"use strict";

// modules
const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');
const auth = require('./auth.js');
const redisFunctions = require('./redisFunctions.js');
const env = require('env2')('./config.env');
const port = process.env.PORT;

// routes
const Home = require('./routes/home.js');
const Blog = require('./routes/blog.js');
const SinglePost = require('./routes/singlePost.js');
const Resources = require('./routes/resources.js');
const Admin = require('./routes/admin.js');
const AddPost = require('./routes/addPost.js');
const AddComment = require('./routes/addComment.js');

// Hapi plugins
const plugins = [
	Inert,
	Vision,
	Basic
];

server.connection({
	port: port
});

server.register(plugins, (err) => {
	if (err) console.log(err);

	server.auth.strategy('simple', 'basic', {
		validateFunc: auth.validate
	});

	server.views(require('./viewSettings.js'));
	server.route([
		Home,
		Blog,
		SinglePost,
		Admin,
		AddPost,
		AddComment,
		Resources,
	]);
});

server.start(err => {
	if (err) throw err;
	console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
	init: server
};
