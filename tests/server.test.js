var tape = require('tape');
var shot = require('shot');
var server = require('../server/server.js');
var fs = require('fs');


tape('check that tests work!', function(t) {
    t.equal(1, 1, 'success!');
    t.end();
});

tape('check that server responds', function(t) {
    shot.inject(server.router, {
        method: 'GET',
        url: '/'
    }, function(response) {
        t.equal(response.statusCode, 200,
            'Response "200" received from server');
        t.end();
    });
});
