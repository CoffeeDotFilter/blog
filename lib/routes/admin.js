module.exports = {
  method: 'GET',
  path: '/admindotfilter',
  config: {
    auth: 'simple',
    handler: function (request, reply) {
      reply.view('dashboard', {
        author: request.auth.credentials.username,
        title: 'Admin View',
        link: 'https://cdn.tinymce.com/4/tinymce.min.js'
      });
    }
  }
};
