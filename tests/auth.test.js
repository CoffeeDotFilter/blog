"use strict";

const tape = require('tape');
const redisFunctions = require('../redisFunctions.js');
const server = require('../server.js');
const auth = require('../auth.js');
const client = redisFunctions.client;

let basicHeader = (username, password) => {
    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
};

tape('Server and validate function should work correctly', (t) => {
	t.plan(3);
	server.init.inject({method: 'GET', url: '/admindotfilter'}, (response) => {
    t.equal(response.statusCode, 401,'Server returns 401 Unauthorised (without username/password)');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('MattTheHacker', '<scriptInjectionz!>')}}, (response) => {
    t.equal(response.statusCode, 500,'Server returns 500 with wrong credentials');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('2093084832fapdsahf', 'ur89ea0whpgu24')}}, (response) => {
    t.equal(response.statusCode, 500,'Server returns 500 with wrong credentials');
  });
	// server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('fakeusername', 'correctPassword')}}, (response) => {
 //    t.equal(response.statusCode, 200,'Server returns 200 for a correct password');
 //  });
});
