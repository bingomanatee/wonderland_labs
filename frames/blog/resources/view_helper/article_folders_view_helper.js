var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Gate = require('gate');
/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

// @TODO: add selected option

var dir_select_template = _.template('<select name="<%= name %>" ><option value="">(root)</option> <% dirs.forEach(function(dir){ %> ' +
	'<option value="<%= dir.name %>"><%= dir.name %></option> ' +
	'<% }) %></select>');

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	var helper = {
		name: 'layout',

		test: function (ctx, output) {
			return output._article_folders;
		},

		weight: 0,

		respond: function (ctx, output, done) {
			var model = apiary.model('blog_article');
			fs.readdir(model.ARTICLE_DIR, function(err, files){

				var gate = Gate.create();

				var dirs = [];
				files.forEach(function(file){
					var file_path = path.resolve(model.ARTICLE_DIR, file);
					var l = gate.latch();
					fs.stat(file_path, function(err, st){
						if (st.isDirectory()){
							dirs.push({
								name: file,
								path: file_path
							});
						}
						l();
					});
				})

				gate.await(function(){
					output.article_folders = dirs;
					output.article_folder_select = function(name, current){
						console.log('making folder with name ', name);
						return dir_select_template({dirs: dirs, name : name , current: current})
					}
					done();
				})
			})
		}
	};

	cb(null, helper);
};