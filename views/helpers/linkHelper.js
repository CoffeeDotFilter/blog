module.exports = function (title) {
	return encodeURIComponent(title.split(' ').join('-'));
};
