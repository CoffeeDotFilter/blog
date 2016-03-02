const tape = require('tape');
const redisFunctions = require('../redisFunctions.js');
const server = require('../server.js');
const auth = require('../auth.js');
const client = redisFunctions.client;

tape('getUserPassword function should return correct encrypted password for all users', (t) => {
	client.HMSET(	'admins', 	'jack', '$2a$04$fq7Z0w0rZ5MZJXlaGgqh/..gXbQy3ouZq5Tin1mqzv9ZAhnikteSm', 
								'andrew', '$2a$04$tMlf5bQ8PKLdeaox8pquzuBRaOdEUYQJ7kfccUsP8aUnKFgtw58Um',
								'owen', '$2a$04$QtmS.3dN5kH0X2XEXl1dTOO9Isu34aTH3ubNAHr3XEG6/7Puq3U/W');
	t.plan(3);
	auth.getUserPassword('jack', (DBpassword) => {
		t.equal(DBpassword, '$2a$04$fq7Z0w0rZ5MZJXlaGgqh/..gXbQy3ouZq5Tin1mqzv9ZAhnikteSm', 'password matches for Jack');
	});
	auth.getUserPassword('andrew', (DBpassword) => {
		t.equal(DBpassword, '$2a$04$tMlf5bQ8PKLdeaox8pquzuBRaOdEUYQJ7kfccUsP8aUnKFgtw58Um', 'password matches for Andrew');
	});
	auth.getUserPassword('owen', (DBpassword) => {
		t.equal(DBpassword, '$2a$04$QtmS.3dN5kH0X2XEXl1dTOO9Isu34aTH3ubNAHr3XEG6/7Puq3U/W', 'password matches for Owen');
	});
});

function basicHeader(username, password) {
    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
}

tape('Server and validate function should work correctly', (t) => {
	t.plan(6);
	server.init.inject({method: 'GET', url: '/admindotfilter'}, function(response) {
    t.equal(response.statusCode, 401,'Server returns 401 Unauthorised (without username/password)');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('MattTheHacker', '<scriptInjection11!>')}}, function(response) {
    t.equal(response.statusCode, 500,'Server returns 500 with wrong credentials');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('2093084832fapdsahf', 'ur89ea0whpgu24')}}, function(response) {
    t.equal(response.statusCode, 500,'Server returns 401 with wrong credentials');
  });
	server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('jack', 'fish')}}, function(response) {
    t.equal(response.statusCode, 200,'Server returns 401 Unauthorised (without password)');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('owen', 'the redis is the best')}}, function(response) {
    t.equal(response.statusCode, 200,'Server returns 401 Unauthorised (without password)');
  });
  server.init.inject({method: 'GET', url: '/admindotfilter', headers: {authorization: basicHeader('andrew', 'bosh')}}, function(response) {
    t.equal(response.statusCode, 200,'Server returns 401 Unauthorised (without password)');
  });
});
