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

	/* ************* POST *************** */

	on_post_validate: function(context, callback){
		var member_model = this.model('member');

		if (!context.name){
			return context.$send({error: 'name missing'});
		}

		member_model.ican(context, ['add folder'], callback, function(){
			context.$send({error: 'not authorized to add folder'});
		})
	},

	on_post_process: function(context, callback){
		var model = this.model('blog_article');
		model.add_folder(context.name, callback);
	},

	on_post_output: function(context, callback){
		context.$send({name: context.name}, callback);
	},

	/* ************* GET **************** */

	on_get_validate: function (context, callback) {
		callback();
	},

	on_get_input: function (context, callback) {
		var model = this.model('blog_article');
		model.articles_folders(function (err, folders) {
			context._folders = folders;
			callback();
		});
	},

	on_get_output: function (context, callback) {
		context.$send(_.map(
			context._folders,
			function (folder) {
				return {
					name: folder
				}
			}), callback);
	}

}; // end action