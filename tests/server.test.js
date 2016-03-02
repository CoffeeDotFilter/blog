var tape = require('tape');
var server = require('../server.js');
var fs = require('fs');


tape('check that tests work!', function(t) {
  t.equal(1, 1, 'success!');
  t.end();
});

tape('check that server responds', function(t) {
  server.init.inject({method: 'GET', url: '/'}, function(response) {
    t.equal(response.statusCode, 200,
      'Response "200" received from server');
    t.end();
  });
});

tape('check that server returns something for '/' request', (t) => {
	server.init.inject({method: 'GET', url: '/'}, (response) => {
		t.ok(response.payload.indexOf('Welcome to Coffee.filter()'), 'server returns index page');
		t.end();
	});
});

tape('check that server loads css', (t) => {
  server.init.inject({method: 'GET', url: '/style.css'}, (response) => {
    t.ok(response.payload.indexOf('}') > -1, 'css loads properly');
    t.end();
  });
});

tape('check that server loads client side js', (t) => {
  server.init.inject({method: 'GET', url: '/script.js'}, (response) => {
    t.ok(response.payload.indexOf('function') > -1, 'client side js loads properly');
    t.end();
  });
});

tape('teardown', function(t) {
  server.init.stop();
  t.end();
});
