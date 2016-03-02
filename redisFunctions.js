var redis = require('fakeredis');
var client = redis.createClient();

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
		} else {
			console.log('Add user message success: ' + reply);
		}
	});
}

function addComment(commentObj, date) {
	var stringifiedObj = JSON.stringify(commentObj);
	var commentName = 'comments' + date;
	client.ZADD(commentName, commentObj.date, stringifiedObj, function(error, reply) {
		if (error) {
			console.log(error);
		} else {
			console.log('Add user message success: ' + reply);
		}
	});
}

function getOnePost(postName, callback) {
	client.HGETALL(postName, function(err, reply){
		if(err) {
			console.log(err);
		} else {
			callback(reply);
		}
	});
}

function get10Posts(callback) {
	client.ZRANGE('posts', 0, 10, function(error, reply) {
		if (error) {
			console.log(error);
		} else {
			callback(reply);
		}
	});
}

// addPostToDB(myPostObject);
// addComment(myCommentObj, myPostObject.date);
// addComment(myCommentObj2, myPostObject.date);
//
// get10Posts(function(array) {
// 	array.forEach(x => {
// 		getOnePost(x, post => console.log(post));
// 	});
// });

module.exports = {
	client: client,
	addPostToDB: addPostToDB,
	addComment: addComment,
	getOnePost: getOnePost,
	get10Posts: get10Posts
};
