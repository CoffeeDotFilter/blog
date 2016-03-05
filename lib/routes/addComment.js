const redisFunctions = require('../redisFunctions.js');

module.exports = {
  method: 'POST',
  path: '/blog/{title*}',
  handler: (request, reply) => {
    const commentDate = Date.now();
    const commentObj = {
      body: request.payload.body,
      date: commentDate,
      author: request.payload.author
    };
    redisFunctions.addComment(commentObj, request.payload.date);
    reply.redirect('/blog/' + request.params.title);
  }
};
