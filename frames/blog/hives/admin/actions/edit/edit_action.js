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

	on_get_validate: function (context, callback) {
		var model= this.model('blog_article');
		if (!context.filename){
			 model.addError('no filename');
			return callback(model.error(context));

		}
		model.exists(context.filename, function(ex){
			if (!ex){
				model.addError('cannot find article ' + context.filename);
				callback(model.error(context));
			} else {
				callback();
			}
		})
	},

	on_get_input: function (context, callback) {

		var model= this.model('blog_article');
		model.get(context.filename, function(err, article){
			if (err){
				callback(err);
			} else {
				context.$out.set('article', article);
				callback();
			}
		})
	},

	on_get_process: function (context, callback) {
		callback();
	},

	on_post_validate: function (context, done) {

		var model = this.model('blog_article');

		if (!context.filename){
			model.addError(context, 'Filename missing');
		}

		if (!context.title){
			model.addError(context, 'Title missing');
		}

		if (!context.content){
			model.addError(context, 'Content missing');
		}

		if (model.hasErrors(context)) {
			return done(model.error(context));
		}


		model.exists(context.filename, function(ex){
			if (!ex){
				done(new Error(context.$out.get('errors')[0]));
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
			context.$go('/blog/' + context.filename, done);
		});
	}

}; // end action