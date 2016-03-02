var tape = require('tape');
var redisFunctions = require('../redisFunctions.js');
var server = require('../server.js');
var client = redisFunctions.client;

client.select(3, function() {
	'connected to db3';
});

tape('test can write list to db', function(t) {
	var array = ['1', '2', '3', '4', '5'];
	var listName = 'testList';
	client.RPUSH(listName, array);
	client.LRANGE(listName, 0, -1, function(error, reply) {
		t.ok(!error, 'assert error is empty');
		t.deepEqual(reply, array, 'assert arrays match!');
		client.FLUSHDB();
		t.end();
	});
});
//

tape('addPostToDB should store a post object as a hash', function(t) {
	var myPostObject = {
		body: 'LOrem Ipsum is great',
		date: '12345',
		author: 'Owen',
		picture: 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40',
		title: 'Our 5th post',
		comments: 'comments' + this.date
	};
	redisFunctions.addPostToDB(myPostObject);
	client.HGET('post12345', 'body', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, 'LOrem Ipsum is great', 'post object has the correct body');
		}
	});
	client.HGET('post12345', 'date', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, '12345', 'post object has the correct date');
		}
	});
	client.HGET('post12345', 'author', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, 'Owen', 'post object has the correct author');
		}
	});
	client.HGET('post12345', 'picture', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40', 'post object has the correct picture');
		}
	});
	client.HGET('post12345', 'title', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, 'Our 5th post', 'post object has the correct title');
		}
	});
	client.HGET('post12345', 'comments', function(error, reply) {
		if (error) {
			console.log(error);
			t.fail('db errored');
		} else {
			console.log('success');
			t.equal(reply, 'comments12345', 'post object has the correct comments property');
		}
	});
	client.FLUSHDB();
	t.end();
});


tape('teardown', function(t) {
	server.init.stop();
	client.flushdb();
	client.quit();
	t.end();
});


// tests.module1('username and password can be added to db', function(t) {
// 	var username = 'andrew';
// 	var password = 12345;
// 	redisFunctions.addUser(username, password, client);
// 	var expected = {
// 		'andrew': '12345'
// 	};
// 	client.HGETALL('users', function(error, reply) {
// 		t.ok(!error, 'assert error is empty');
// 		t.deepEqual(reply, expected, 'user has been added to db!');
// 		client.flushdb();
// 		t.end();
// 	});
// });
