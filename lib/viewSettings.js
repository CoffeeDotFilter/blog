const Handlebars = require('handlebars');

module.exports = {
	engines: { html: Handlebars },
	relativeTo: __dirname,
	path: '../views',
	layout: 'default',
	layoutPath: '../views/layout',
	helpersPath: '../views/helpers',
	partialsPath: '../views/partials'
};
