var _ = require('underscore');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var template = _.template('<a class="folder" href="/blog_folder/<%= folder %>"><%= folder %></a>');

/* ********* EXPORTS ******** */

module.exports = function(folder){
	return template({folder: folder})
};