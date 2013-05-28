var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var marked = require('marked');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = {

	on_validate: function (context, callback) {
		if (!context.filename) {
			callback(new Error('No filename'))
		} else {
			var model = this.model('blog_article');
			model.exists(context.filename, function (has_article) {
				if (!has_article) {
					callback(new Error("cannot find article" + context.filename));
				} else {
					callback();
				}
			})
		}
	},

	on_input: function (context, callback) {
		var model = this.model('blog_article');
		model.get(context.filename, function(err, article){
			if (err){
				return callback(err);
			}
			context.$out.set('article', article);
			callback();
		})
	},

	on_process: function (context, callback) {
		context.$out.set('html', marked(context.$out.get('article').content));
		callback();
	}

} // end action