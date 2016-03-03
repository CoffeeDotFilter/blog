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

  if(err) console.log(err);

	server.auth.strategy('simple', 'basic', {
		validateFunc: auth.validate
	});

	server.views({
		engines: {html: Handlebars},
		relativeTo: __dirname,
		path: 'views',
		layout: 'default',
		layoutPath: 'views/layout',
    helpersPath: 'views/helpers',
    partialsPath: 'views/partials',
	});

	server.route([{
	  method: 'GET',
	  path: '/',
	  handler: (request, reply) => {
      redisFunctions.get10Posts((data) => {
        if (data) {
          reply.view('home', {title: 'Coffee Dot Filter Blog', posts: data});
        } else {
          reply.view('home', {title: 'Coffee Dot Filter Blog'});
        }
      });
	  }
	}, {
    method: 'GET',
    path: '/blog',
    handler: (request, reply) => {
      reply.view('blog');
    }
  }, {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {path: 'public'}
    }
  }, {
	  method: 'GET',
	  path: '/admindotfilter',
		config: {
		      auth: 'simple',
		      handler: function (request, reply) {
            console.log(request.auth);
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
