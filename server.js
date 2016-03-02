"use strict";

const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');

server.connection({
  port: 3000
});

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('hello CoffeeDotFilter blog!');
  }
});

server.start(err => {
  if (err) throw err;
  console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
  init: server
};
