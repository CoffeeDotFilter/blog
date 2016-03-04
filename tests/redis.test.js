"use strict";

const tape = require('tape');
const redisFunctions = require('../redisFunctions.js');
const server = require('../server.js');
let client = redisFunctions.client;

client.select(3, function () {
	'connected to db3';
});

tape('test can write list to db', (t) => {
	const array = ['1', '2', '3', '4', '5'];
	const listName = 'testList';
	client.RPUSH(listName, array);
	client.LRANGE(listName, 0, -1, (error, reply) => {
		t.ok(!error, 'assert error is empty');
		t.deepEqual(reply, array, 'assert arrays match!');
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

tape('getMultiplePosts gets 10 posts back', (t) => {
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
		postObject.title = postObject.title + i;
		redisFunctions.addPostToDB(postObject);
	}
	redisFunctions.getMultiplePosts(10, (reply) => {
		t.equal(reply.length, 10, 'gets 10 posts back');
		t.equal(reply[0].date, '12354', 'first post has correct timestamp');
		t.equal(reply[1].date, '12353', 'second post has correct timestamp');
		t.equal(reply[2].date, '12352', 'third post has correct timestamp');
		t.equal(reply[9].date, '12345', '10th post has correct timestamp');
		t.end();
	});
});

tape('getPostByName returns single (correct) post', (t) => {
	redisFunctions.getPostByName('Our 5th post0', (postObj) => {
		t.equal(typeof postObj, 'object', 'reply is an object');
		t.equal(postObj.title, 'Our 5th post0', 'object has correct title');
		t.notEqual(postObj.title, 'Some other title', 'object does not have incorrect title');
		t.end();
	});
});


tape('getComments returns array of comments for particular post', (t) => {
	redisFunctions.getComments('comments12345', (commentsArray) => {
		t.ok(commentsArray instanceof Array, 'reply is an array');
		t.equal(JSON.parse(commentsArray[0]).body, 'this post is rubbish', 'array contains correct comment objects');
		t.notEqual(JSON.parse(commentsArray[0]).body, 'Some other comment', 'object does not have incorrect body');
		t.end();
	});
});

// Server tests........
tape('check that server responds', (t) => {
	server.init.inject({ method: 'GET', url: '/' }, (response) => {
		t.equal(response.statusCode, 200, 'Response "200" received from server');
		t.end();
	});
});

tape('check that server returns index for "/" request', (t) => {
	server.init.inject({ method: 'GET', url: '/' }, (response) => {
		t.ok(response.payload.indexOf('Welcome to Coffee.filter()'), 'server returns index page');
		t.end();
	});
});

tape('check that server returns correct page for "/blog" request', (t) => {
	server.init.inject({ method: 'GET', url: '/blog' }, (response) => {
		t.ok(response.payload.indexOf('<title>Blog - Coffee Dot Filter Blog</title>'), 'server returns blog home page');
		t.ok(response.payload.indexOf('LOrem Ipsum is great'), 'blog page contains blog post');
		t.end();
	});
});

tape('check that blog page contains first blog', (t) => {
	server.init.inject({ method: 'GET', url: '/blog/Our-5th-post0' }, (response) => {
		t.ok(response.payload.indexOf('LOrem Ipsum is great'), 'blog page includes post');
		t.ok(response.payload.indexOf('this post is rubbish'), 'blog page includes comments');
		t.end();
	});
});

tape('check that post request from admin page works', (t) => {
	server.init.inject({
		method: 'POST',
		url: '/admindotfilter',
		payload: 'body="stuff"',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': '12'
		}
	}, (response) => {
		console.log(response.raw.res);
		t.equal(response.raw.res.statusCode, 302, 'response should redirect');
		t.equal(response.raw.res._headers.location, '/blog', 'redirect location should be blog page');
		t.end();
	});
});

tape('check that comment post request works', (t) => {
	server.init.inject({
		method: 'POST',
		url: '/blog/Our-5th-post0',
		payload: 'body=foobarfoobar&date=12345&author=me',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': '12'
		}
	}, (response) => {
		t.equal(response.raw.res.statusCode, 302, 'response should redirect');
		t.equal(response.raw.res._headers.location, '/blog/Our-5th-post0', 'redirect location should be same page');
		client.flushdb();
		t.end();
	});
});

tape('check that server returns correct page for "/blog" request with empty database', (t) => {
	server.init.inject({method: 'GET', url: '/blog'}, (response) => {
		t.ok(response.payload.indexOf('<title>Blog - Coffee Dot Filter Blog</title>'), 'server returns blog home page');
		t.equal(response.payload.indexOf('LOrem Ipsum is great'), -1, 'blog page does not contain blog post');
		t.end();
	});
});

tape('check that server returns index for "/" request with empty database', (t) => {
	server.init.inject({method: 'GET', url: '/'}, (response) => {
		t.ok(response.payload.indexOf('Welcome to Coffee.filter()'), 'server returns index page');
		t.equal(response.payload.indexOf('LOrem Ipsum is great'), -1, 'blog page does not contain blog post');
		t.end();
	});
});

tape('close redis client', (t) => {
	client.flushdb();
	client.quit();
	t.end();
});

tape('getComments returns error in case of error', (t) => {
	redisFunctions.getMultiplePosts(10, (reply) => {
		t.equal(typeof reply, 'object', 'returns error object, not array of posts');
		t.equal(reply.command, 'ZREVRANGE', 'error object has expected property');
		t.end();
	});
});

tape('getPostByName returns error in case of error', (t) => {
	redisFunctions.getPostByName('Our 5th post0', (postObj) => {
		t.equal(typeof postObj, 'object', 'returns error object, not array of posts');
		t.equal(postObj.command, 'ZRANGE', 'error object has expected property');
		t.end();
	});
});

tape('getOnePost returns error in case of error', (t) => {
	redisFunctions.getOnePost('post12345', (reply) => {
		t.equal(typeof reply, 'object', 'returns error object, not array of posts');
		t.equal(reply.command, 'HGETALL', 'error object has expected property');
		t.end();
	});
});

tape('getMultiplePosts returns error in case of error', (t) => {
	redisFunctions.getMultiplePosts(10, (reply) => {
		t.equal(typeof reply, 'object', 'returns error object, not array of posts');
		t.equal(reply.command, 'ZREVRANGE', 'error object has expected property');
		t.end();
	});
});

tape('close redis client', (t) => {
	server.init.stop();
	t.end();
});
