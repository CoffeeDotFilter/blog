const redisFunctions = require('../redisFunctions.js');

module.exports = {
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    redisFunctions.getMultiplePosts(3, (data) => {
      const title = 'Coffee Dot Filter Blog';
      if (data) {
        reply.view('home', { title: title, posts: data });
      } else {
        reply.view('home', { title: title });
      }
    });
  }
};
