"use strict";

const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');

server.connection({
  port: 3000
});

const plugins = [
	Inert,
	Vision,
	Handlebars
];

server.register([Vision, Inert], (err) => {

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
	    reply.view('home', {title: 'Coffee Dot Filter Blog'});
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
  }]);
});


server.start(err => {
  if (err) throw err;
  console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
  init: server
};
