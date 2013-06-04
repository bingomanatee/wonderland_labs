var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = {

	on_input: function (context, callback) {
		var model = this.model('blog_article');
		model.list(function(err, articles){
			if (err) {
				callback(err);
			} else {
				context.$send(articles, callback);
			}
		});
	}

}; // end action