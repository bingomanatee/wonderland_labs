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

	on_get_validate: function (context, done) {
		var model = this.model('blog_article');
		if (!context.file_name) {
			return done(new Error('no file name'));

		}
		model.exists(context, function (ex) {
			if (!ex) {
				model.addError(context, 'cannot find article ' + context.file_name);
				done(new Error('cannot find article ' + context.file_name));
			} else {
				done();
			}
		})
	},

	on_get_input: function (context, done) {
		var model = this.model('blog_article');
		model.get(context, function (err, article) {
			if (err) {
				done(err);
			} else {
				context.$out.set('article', article);
				done();
			}
		})
	},

	on_get_output: function (context, done) {
		context.$out.set('article_editor', true);
		done();
	}

}; // end action