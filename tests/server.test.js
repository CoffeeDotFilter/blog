const tape = require('tape');
const server = require('../server.js');
const fs = require('fs');
const client = require('../redisFunctions.js').client;

tape('check that tests work!', (t) => {
  t.equal(1, 1, 'success!');
  t.end();
});

// tape('check that server responds', (t) => {
//   server.init.inject({method: 'GET', url: '/'}, (response) => {
//     t.equal(response.statusCode, 200,'Response "200" received from server');
//     t.end();
//   });
// });

// tape('check that server returns something for '/' request', (t) => {
// 	server.init.inject({method: 'GET', url: '/'}, (response) => {
// 		t.ok(response.payload.indexOf('Welcome to Coffee.filter()'), 'server returns index page');
// 		t.end();
// 	});
// });

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

tape('teardown', (t) => {
  server.init.stop();
  t.end();
});
