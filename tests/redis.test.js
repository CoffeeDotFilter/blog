var tape = require('wrapping-tape');
var redis = require('redis');
var redisFunctions = require('../server/redis.js');
var shot = require('shot');
var server = require('../server/server.js');
var tests = {};
var client;

tests.module1 = tape({
	setup: function(t) {
		client = redisFunctions.client;
		client.select(3, function() {
			console.log('connected to db no. 3');
		});
		t.end();
	},
	teardown: function(t) {
		t.end();
	}
});

tests.module1('test can write list to db', function(t) {
	var array = ['1', '2', '3', '4', '5'];
	var listName = 'testList';
	client.RPUSH(listName, array);
	client.LRANGE(listName, 0, -1, function(error, reply) {
		t.ok(!error, 'assert error is empty');
		t.deepEqual(reply, array, 'assert arrays match!');
		client.flushdb();
		t.end();
	});
});

tests.module1('username and password can be added to db', function(t) {
	var username = 'andrew';
	var password = 12345;
	redisFunctions.addUser(username, password, client);
	var expected = {
		'andrew': '12345'
	};
	client.HGETALL('users', function(error, reply) {
		t.ok(!error, 'assert error is empty');
		t.deepEqual(reply, expected, 'user has been added to db!');
		client.flushdb();
		t.end();
	});
});
