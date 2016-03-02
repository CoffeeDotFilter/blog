"use strict";

const tape = require('tape');
const redisFunctions = require('../redisFunctions.js');
const server = require('../server.js');
const client = redisFunctions.client;

client.select(3, function() {
	'connected to db3';
});

tape('test can write list to db', (t) => {
	const array = ['1', '2', '3', '4', '5'];
	const listName = 'testList';
	client.RPUSH(listName, array);
	client.LRANGE(listName, 0, -1, (error, reply) => {
		t.ok(!error, 'assert error is empty');
		t.deepEqual(reply, array, 'assert arrays match!');
		client.FLUSHDB();
		t.end();
	});
});

tape('addPostToDB should store a post object as a hash', (t) => {
	const myPostObject = {
		body: 'LOrem Ipsum is great',
		date: 12345,
		author: 'Owen',
		picture: 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40',
		title: 'Our 5th post',
		comments: 'comments' + this.date
	};
	redisFunctions.addPostToDB(myPostObject);
	t.plan(6);
	client.HGETALL('post12345', (err, reply) => {
		t.equal(reply.body, 'LOrem Ipsum is great', 'post added with correct body');
		t.equal(reply.date, '12345', 'post added with correct date');
		t.equal(reply.author, 'Owen', 'post added with correct author');
		t.equal(reply.picture, 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40', 'post added with correct picture');
		t.equal(reply.title, 'Our 5th post', 'post added with correct title');
		t.equal(reply.comments, 'comments12345', 'post added with correct comments');
	});
});

tape('addcomment should store a comment in a sorted set', (t) => {
	const myCommentObj = {
		body: 'this post is rubbish',
		date: '54321',
		author: 'Sohil'
	};
	redisFunctions.addComment(myCommentObj, '12345');
	t.plan(3);
	client.ZRANGE('comments12345', 0, -1, (err, reply) => {
		if (err) console.log(err);
		else {
			const parsedCommentObj = JSON.parse(reply);
			t.equal(parsedCommentObj.body, 'this post is rubbish', 'comment has the correct body');
			t.equal(parsedCommentObj.date, '54321', 'comment has the correct date');
			t.equal(parsedCommentObj.author, 'Sohil', 'comment has the correct author');
		}
	});
});

tape('getOnePost should get a specific post object from the db', (t) => {
	redisFunctions.getOnePost('post12345', (reply) => {
		t.equal(reply.body, 'LOrem Ipsum is great', 'post has correct body');
		t.equal(reply.date, '12345', 'post has correct date');
		t.equal(reply.author, 'Owen', 'post has correct author');
		t.equal(reply.picture, 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40', 'post has correct picture');
		t.equal(reply.title, 'Our 5th post', 'post has correct title');
		t.equal(reply.comments, 'comments12345', 'post has correct comments');
		t.end();
	});
});

tape('get10Posts gets 10 posts back', (t) => {
	let postObject = {
		body: 'LOrem Ipsum is great',
		date: 12345,
		author: 'Owen',
		picture: 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40',
		title: 'Our 5th post',
		comments: 'comments' + this.date
	};
	for (let i = 0; i < 10; i++) {
		postObject.date = 12345 + i;
		redisFunctions.addPostToDB(postObject);
	}
	redisFunctions.get10Posts((reply) => {
		t.equal(reply.length, 10, 'gets 10 posts back');
		t.equal(reply[0], 'post12354', 'first post is correct');
		t.equal(reply[1], 'post12353', 'second post is correct');
		t.equal(reply[2], 'post12352', 'third post is correct');
		t.equal(reply[9], 'post12345', '10th post is correct');
		t.end();
	});
});

tape('teardown', t => {
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
