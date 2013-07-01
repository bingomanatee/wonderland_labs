var _ = require('underscore');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var template = _.template('<a href="/blog/<%= url %>"><%= title %></a>');

/* ********* EXPORTS ******** */

module.exports = function (article, text) {
		var url = article.folder ? article.folder + '/' + article.file_name : article.file_name;
		return template({url: url, title: text || article.title});
}; // end export function