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
		if (!context.file_name) {
			callback(new Error('No file_name'))
		} else {
			var model = this.model('blog_article');
			context.id = _.compact([context.folder, context.file_name]).join('/');

			model.exists(context.id, function (has_article) {
				if (!has_article) {
					callback(new Error("cannot find article" + context.file_name));
				} else {
					callback();
				}
			})
		}
	},

	on_input: function (context, callback) {
		var model = this.model('blog_article');
		console.log('getting article %s', util.inspect(context, false, 0));
		model.get(context.id, function(err, article){
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