var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function addError(context, error){
	var errors = context.$out.get('errors', []) || [];

	errors.push(error);
	context.$out.set('errors', errors);
}

function hasErrors(context){
	var errors = context.$out.get('errors');
	if (!errors){
		return false;
	} else {
		return errors.length;
	}
}

/* ********* EXPORTS ******** */

module.exports = {

	on_get_validate: function (context, callback) {
		if (!context.filename){
			return callback(new Error('no filename'));
		}
		var model= this.model('blog_article');
		model.exists(context.filename, function(ex){
			if (!ex){
				callback(new Error('cannot find article ' + context.filename));
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

	on_post_validate: function (context, callback) {

		if (!context.filename){
			addError(context, 'Filename missing');
		}

		if (!context.title){
			addError(context, 'Title missing');
		}

		if (!context.content){
			addError(context, 'Content missing');
		}

		var model = this.model('blog_article');

		model.exists(context.filename, function(ex){
			if (ex){
				addError(context, 'Article exists');
			}
			callback();
		})
	},

	on_post_input: function (context, callback) {
		if (hasErrors(context)){

		} else {

			var model = this.model('blog_article');

			model.put(context.filename, '#' + context.title + "\n\n" + context.content);

			callback();
		}
	},

	on_post_process: function (context, callback) {
		callback();
	}

} // end action