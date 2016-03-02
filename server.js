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

server.connection({
  port: 3000
});

const plugins = [
	Inert,
	Vision,
	Basic
];

server.register(plugins, (err) => {

	server.auth.strategy('simple', 'basic', { 
		validateFunc: auth.validate,
	});

	server.views({
		engines: {html: Handlebars},
		relativeTo: __dirname,
		path: 'views',
		layout: 'default',
		layoutPath: 'views/layout',
    partialsPath: 'views/partials'
	});

	server.route([{
	  method: 'GET',
	  path: '/',
	  handler: (request, reply) => {
      redisFunctions.get10Posts((hashNames) => {
        let postCounter = 0;
        let postsArray = [];
        hashNames.forEach((postHash) => {
          redisFunctions.getOnePost(postHash, (data) => {
            postsArray.push(data);
            postCounter++;
            if (postCounter === hashNames.length) {
              console.log(postsArray);
              reply.view('home', {title: 'Coffee Dot Filter Blog', posts: postsArray});
            }
          });
        });
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
		          reply.view('dashboard');
		      }
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
