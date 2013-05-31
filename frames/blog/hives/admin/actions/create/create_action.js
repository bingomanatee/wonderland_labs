var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function clean_file_name(name){
	return name.toLowerCase().replace(/[^\w]+/g, '_');
}

var _default_output = {
	file_name: ''
	, title: ''
	, content: ''
	, tags: ''
	, intro: ''
	, hide: false
	, on_homepage: false};

function ensure_default_output(context){
	_.each(_default_output, function(value, name){
		if (context.$out.has(name)) {
			// ok
		}else if (context.hasOwnProperty(name)){
			context.$out.set(name, context[name]);
		}  else {
			context.$out.set(name, value);
		}
	});
}

/* ********* EXPORTS ******** */

//@TODO: file_name in context - bury with '$'
module.exports = {

	on_get_process: function (context, done) {
		ensure_default_output(context);
		contexxt.$out.set('_article_folders', true);
		done();
	},

	on_post_validate: function (context, done) {
		var model = this.model('blog_article');
		context.file_name = clean_file_name(context.file_name);
		if (!context.file_name) {
			model.addError(context, 'file_name missing');
		}

		if (!context.title) {
			model.addError(context, 'Title missing');
		}

		if (!context.content) {
			model.addError(context, 'Content missing');
		}

		if (model.hasErrors(context)) {
			return done();
		} else {
			model.exists(context.file_name, function (ex) {
				if (ex) {
					model.addError(context, 'Article exists');
					done(model.error(context));
				} else {
					done();
				}
			})
		}
	},

	on_post_input: function (context, done) {
		var model = this.model('blog_article');
		if (model.hasErrors(context)) {
			return done();
		}

		context._data = {
			file_name: context.file_name,
			title: context.title,
			intro: context.intro,
			content:  context.content,
			revised: new Date(),
			tags: context.tags ? context.tags.split(',') : [],
			on_homepage: context.on_homepage || false,
			hide: context.hide || false
		};

		done();
	},

	on_post_process: function (context, done) {
		var model = this.model('blog_article');
		if (model.hasErrors(context)) {
			ensure_default_output(context);
			return done();
		}
		model.put(context._data, function(){
				context.$go('/blog/' + context.file_name, done);
		});
	}

}; // end action