"use strict";

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
	var client = require("redis").createClient(rtg.port, rtg.hostname);
	client.auth(rtg.auth.split(":")[1]);
} else {
    var client = require("redis").createClient();
}

function addPostToDB(postObject){
	var postName = 'post' + postObject.date;
	client.HMSET(postName, 	'body', postObject.body,
							'date', postObject.date,
							'author', postObject.author,
							'picture', postObject.picture,
							'title', postObject.title,
							'comments', 'comments' + postObject.date,
		function(err, reply) {
			if(err) console.log(err);
	});
	client.ZADD('posts', postObject.date, postName, function(error, reply) {
		if (error) {
			console.log(error);
		}
	});
}

let addComment = (commentObj, date) => {
	const stringifiedObj = JSON.stringify(commentObj);
	const commentName = 'comments' + date;
	client.ZADD(commentName, commentObj.date, stringifiedObj, (error, reply) => {
		if (error) {
			console.log(error);
		}
	});
};

function getOnePost(postName, callback) {
	client.HGETALL(postName, function(err, reply){
		if(err) {
			console.log(err);
		} else {
			return callback(reply);
		}
	});
}

function get10Posts(callback) {
	client.ZREVRANGE('posts', 0, 9, function(error, hashNames) {
		if (error) console.log(error);
		else if (hashNames.length === 0) return callback();
    else {
      let postCounter = 0;
      let postsArray = [];
			hashNames.forEach((postHash) => {
        getOnePost(postHash, (data) => {
          postsArray.push(data);
          postCounter++;
          if (postCounter === hashNames.length) {
            return callback(postsArray);
          }
        });
      });
		}
	});
}

module.exports = {
	client: client,
	addPostToDB: addPostToDB,
	addComment: addComment,
	getOnePost: getOnePost,
	get10Posts: get10Posts
};

// var myPostObject = {
// 	body: 'LOrem Ipsum is great',
// 	date: Date.now(),
// 	author: 'Owen',
// 	picture: 'https://google.com.githubusercontent.com/u/13705650?v=3&s=40',
// 	title: 'Our 5th post',
// 	comments: 'comments' + this.date
// };
//
// var myCommentObj = {
// 	body: 'this post is rubbish',
// 	date: Date.now(),
// 	author: 'Sohil'
// };
//
// var myCommentObj2 = {
// 	body: 'seriously bad',
// 	date: Date.now(),
// 	author: 'Huw'
// };
