"use strict";

const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');
const auth = require('./auth.js');

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
		layoutPath: 'views/layout'
	});

	server.route({
	  method: 'GET',
	  path: '/admindotfilter',
		config: {
		      auth: 'simple',
		      handler: function (request, reply) {
		          reply.view('dashboard');
		      }
		  }
	});
	
	server.route({
	  method: 'GET',
	  path: '/',
	  handler: (request, reply) => {
			reply.view('home');
		}
	});
});



server.start(err => {
  if (err) throw err;
  console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
  init: server
};