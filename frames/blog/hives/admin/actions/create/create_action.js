var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function clean_filename(name){
	return name.toLowerCase().replace(/[^\w]+/g, '_');
}

/* ********* EXPORTS ******** */

module.exports = {

	/*on_validate: function (context, callback) {
	 callback();
	 },

	 on_input: function (context, callback) {
	 callback();
	 },

	 on_process: function (context, callback) {
	 callback();
	 }, */

	on_post_validate: function (context, done) {
		var model = this.model('blog_article');
		context.filename = clean_filename(context.filename);
		if (!context.filename) {
			model.addError(context, 'Filename missing');
		}

		if (!context.title) {
			model.addError(context, 'Title missing');
		}

		if (!context.content) {
			model.addError(context, 'Content missing');
		}

		if (model.hasErrors(context)) {
			return done(model.error(context));
		}

		model.exists(context.filename, function (ex) {
			if (ex) {
				model.addError(context, 'Article exists');
				done(model.error(context));
			} else {
				done();
			}
		})
	},

	on_post_input: function (context, done) {
		var model = this.model('blog_article');
		context._content = model.make_content(context);
		done();
	},

	on_post_process: function (context, done) {
		var model = this.model('blog_article');
		model.put(context.filename, context._content, function(){
			model.init(function(){
				context.$go('/blog/' + filename, done);
			});
		});
	}

}; // end action