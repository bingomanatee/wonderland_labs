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
		var member_model = this.model('member');
		var model = this.model('blog_article');

		//@TODO: add edit own article

		if (!context.file_name) {
			return done(new Error('no file name'));
		}

		if (/\{\{/.test()){
			return context.$go('/img/blog/placeholder.gif', done);
		}

		member_model.ican(context, ["edit article"], function () {

			model.exists(context, function (ex) {
				if (!ex) {
					done(new Error('cannot find article ' + context.file_name));
				} else {
					done();
				}
			})

		}, {
			go:      '/',
			message: 'You do not have permission to edit articles',
			key:     'error'
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