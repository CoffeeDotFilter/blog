"use strict";

const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
const redisFunctions = require('./redisFunctions.js');

server.connection({
  port: 3000
});

const plugins = [
	Inert,
	Vision
];

// const myPostObject = {
//   body: 'alksdjskaldjaskldjaskldjaskldjaskdl',
//   date: 12347,
//   author: 'Owen',
//   picture: 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40',
//   title: 'annother random post',
//   comments: 'comments' + this.date
// };

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
  }]);
});


server.start(err => {
  if (err) throw err;
  console.log('Server is running at : ' + server.info.uri);
});

module.exports = {
  init: server
};
