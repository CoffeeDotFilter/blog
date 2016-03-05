const redisFunctions = require('../redisFunctions.js');

module.exports = {
  method: 'POST',
  path: '/admindotfilter',
  handler: (request, reply) => {
    redisFunctions.addPostToDB(request.payload);
    reply.redirect('/blog');
  }
};
