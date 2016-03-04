"use strict";

if (process.env.REDISTOGO_URL) {
	var rtg = require("url").parse(process.env.REDISTOGO_URL);
	var client = require("redis").createClient(rtg.port, rtg.hostname);
	client.auth(rtg.auth.split(":")[1]);
} else {
	var client = require("redis").createClient();
}

const addPostToDB = (postObject) => {
	var postName = 'post' + postObject.date;
	// Set Hash of post with all properties
	client.HMSET(postName,
		'body', postObject.body,
		'date', postObject.date,
		'author', postObject.author,
		'picture', postObject.picture,
		'title', postObject.title,
		'comments', 'comments' + postObject.date,
		function (err, reply) {
			if (err) console.log(err);
		});
	// Add postName to sorted set for access to all posts in order of date
	client.ZADD('posts', postObject.date, postName, function (error, reply) {
		if (error) {
			console.log(error);
		}
	});
};

const addComment = (commentObj, date) => {
	// Stringify object and remove nefarious script injections, and format for markdown
	const stringifiedObj = JSON.stringify(commentObj)
		.replace(/<[^<>]+>/g, 'we h8 hackers')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	const commentName = 'comments' + date;
	// Add to sorted list with name linked to post that comments are from
	// Score is date of the comment, whole comment is value in stringified object
	client.ZADD(commentName, commentObj.date, stringifiedObj, (error, reply) => {
		if (error) {
			console.log(error);
		}
	});
};

const getComments = (commentsHash, callback) => {
	client.ZREVRANGE(commentsHash, 0, -1, (err, commentArray) => {
		if (err) console.log(err);
		else return callback(commentArray);
	});
};

const getOnePost = (postName, callback) => {
	client.HGETALL(postName, function (err, reply) {
		if (err) return callback(err);
		else {
			return callback(reply);
		}
	});
};

const getPostByName = (title, callback) => {
	// Get array of all the posts
	client.ZRANGE('posts', 0, -1, (err, hashNames) => {
		if (err) {
			console.log(err);
			return callback(err);
		} else {
			// Check title of each post for match with title parameter
			hashNames.forEach((postHash) => {
				client.HGET(postHash, 'title', (err, reply) => {
					if (err) console.log(err);
					else {
						if (reply === title) {
							// if match, return entire post object in callback
							getOnePost(postHash, (data) => {
								return callback(data);
							});
						}
					}
				});
			});
		}
	});
};

const getMultiplePosts = (number, callback) => {
	// Fetch most recent 10 posts from sorted set
	client.ZREVRANGE('posts', 0, number - 1, function (error, hashNames) {
		if (error) {
			console.log(error);
			return callback(error);
		} else if (hashNames.length === 0) {
			return callback();
		} else {
			let postCounter = 0;
			let postsArray = [];
			hashNames.forEach((postHash) => {
				getOnePost(postHash, (data) => {
					postsArray.push(data);
					postCounter++;
					// Once all posts have been pushed to array, return array
					if (postCounter === hashNames.length) {
						return callback(postsArray);
					}
				});
			});
		}
	});
};

module.exports = {
	client: client,
	addPostToDB: addPostToDB,
	addComment: addComment,
	getOnePost: getOnePost,
	getMultiplePosts: getMultiplePosts,
	getPostByName: getPostByName,
	getComments: getComments
};
