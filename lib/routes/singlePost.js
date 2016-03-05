const redisFunctions = require('../redisFunctions.js');

module.exports = {
	method: 'GET',
	path: '/blog/{title*}',
	handler: (request, reply) => {
		var postName = request.params.title.split('-').join(' ');
		redisFunctions.getPostByName(postName, (postData) => {
			redisFunctions.getComments(postData.comments, (commentArray) => {
				commentArray = commentArray.map(x => JSON.parse(x));
				reply.view('singlePost', { post: postData, date: postData.date, comments: commentArray });
			});
		});
	}
};
