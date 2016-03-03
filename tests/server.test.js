const tape = require('tape');
const server = require('../server.js');
const fs = require('fs');

tape('check that tests work!', (t) => {
  t.equal(1, 1, 'success!');
  t.end();
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

tape('teardown', (t) => {
  server.init.stop();
  t.end();
});

// Other server tests in redis.test.js to keep client the same between tests