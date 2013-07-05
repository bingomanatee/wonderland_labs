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

var file_edit_link = _.template('/admin/blog_edit/<%= file_name %>');

var folder_edit_link = _.template('/admin/blog_edit/<%= folder %>/<%= file_name %>');

function edit_link(article) {
	if (article.folder) {
		return folder_edit_link(article);
	} else {
		return file_edit_link(article);
	}
}

/* ********* EXPORTS ******** */

module.exports = {

	on_validate: function (context, callback) {
		if (!context.file_name) {
			callback(new Error('No file_name'))
		} else {
			var model = this.model('blog_article');
			model.exists(context, function (has_article) {
				if (!has_article) {
					//@TODO: check permissions
					if (context.folder) {
						context.$go('/admin/blog/create/' + context.folder + '/' + context.file_name, callback);
					} else {
						context.$go('/admin/blog/create/' + context.file_name, callback);
					}
				} else {
					callback();
				}
			})
		}
	},

	on_input: function (context, callback) {
		var model = this.model('blog_article');
		//console.log('getting article %s', util.inspect(context, false, 0));
		model.get(context, function (err, article) {
			if (err) {
				return callback(err);
			}
			context.$out.set('article', article);
			callback();
		})
	},

	on_process: function (context, callback) {
		var model = this.model('blog_article');
		context.$out.set('html', model.article_html(context.$out.get('article').content, context));
		context.$out.set('edit_link', edit_link(context.$out.get('article')));
		callback();
	},

	on_output: function(context, done){
		member_model = this.model('member');
		member_model.ican(context, ['edit article'] , function(){
			context.$out.set('iCanEditArticle', true);
			done();
		},
		function(){
			context.$out.set('iCanEditArticle', false);
			done();
		})
	}

} // end action