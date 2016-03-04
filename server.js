"use strict";

const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');
const auth = require('./auth.js');
const redisFunctions = require('./redisFunctions.js');
const env = require('env2')('./config.env');
const port = process.env.PORT;

server.connection({
	port: port
});

const plugins = [
	Inert,
	Vision,
	Basic
];

server.register(plugins, (err) => {

	if (err) console.log(err);

	server.auth.strategy('simple', 'basic', {
		validateFunc: auth.validate
	});

	server.views({
		engines: { html: Handlebars },
		relativeTo: __dirname,
		path: 'views',
		layout: 'default',
		layoutPath: 'views/layout',
		helpersPath: 'views/helpers',
		partialsPath: 'views/partials'
	});

	server.route([{
		method: 'GET',
		path: '/',
		handler: (request, reply) => {
			redisFunctions.get10Posts((data) => {
				const title = 'Coffee Dot Filter Blog';
				if (data) {
					reply.view('home', { title: title, posts: data });
				} else {
					reply.view('home', { title: title });
				}
			});
		}
	}, {
		method: 'GET',
		path: '/blog',
		handler: (request, reply) => {
			redisFunctions.get10Posts((data) => {
				const title = 'Blog - Coffee Dot Filter Blog';
				if (data) {
					reply.view('blog', { title: title, posts: data });
				} else {
					reply.view('blog', { title: title });
				}
			});
		}
  }, {
		method: 'GET',
		path: '/blog/{title*}',
		handler: (request, reply) => {
			var postName = request.params.title.split('-').join(' ');
			redisFunctions.getPostByName(postName, (postData) => {
				redisFunctions.getComments(postData.comments, (commentArray) => {
					commentArray = commentArray.map(x => JSON.parse(x));
					reply.view('singlePost', { post: postData, date: postData.date, comments: commentArray });
				});
			});
		}
  }, {
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: { path: 'public' }
		}
  }, {
		method: 'GET',
		path: '/admindotfilter',
		config: {
			auth: 'simple',
			handler: function (request, reply) {
				reply.view('dashboard', {
					author: request.auth.credentials.username,
					title: 'Admin View',
					link: 'https://cdn.tinymce.com/4/tinymce.min.js'
				});
			}
		}
	}, {
		method: 'POST',
		path: '/admindotfilter',
		handler: (request, reply) => {
			redisFunctions.addPostToDB(request.payload);
			reply.redirect('/blog');
		}
  }, {
		method: 'POST',
		path: '/blog/{title*}',
		handler: (request, reply) => {
			const commentDate = Date.now();
			const commentObj = {
				body: request.payload.body,
				date: commentDate,
				author: request.payload.author
			};
			redisFunctions.addComment(commentObj, request.payload.date);
			reply.redirect('/blog/' + request.params.title);
		}
  }]);
});



server.start(err => {
	if (err) throw err;
	console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
	init: server
};
