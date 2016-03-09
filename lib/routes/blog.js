const redisFunctions = require('../redisFunctions.js');

module.exports = {
	method: 'GET',
	path: '/blog',
	handler: (request, reply) => {
		redisFunctions.getMultiplePosts(10, (data) => {
			const title = 'Blog - Coffee Dot Filter Blog';
			if (data) {
				reply.view('blog', { title: title, posts: data });
			} else {
				reply.view('blog', { title: title });
			}
		});
	}
}
