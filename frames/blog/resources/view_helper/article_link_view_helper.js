var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var template = _.template('<a href="/blog/<%= url %>"><%= title %></a>');
link = function(article){
	var url = article.folder ? article.folder + '/' + article.file_name : article.file_name;
	return template(_.extend({url: url}, article));
};

var click_template = _.template(' onClick="document.location=\'/blog/<%= url %>\'" ');
link_click = function(article){
	var url = article.folder ? article.folder + '/' + article.file_name : article.file_name;
	return click_template(_.extend({url: url}, article));
};

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	var helper = {
		name: 'layout',

		test: function (ctx, output) {
			return  true
		},

		weight: 0,

		respond: function (ctx, output, done) {
			if (!output.helpers) output.helpers = {};
			if (!output.helpers.article) output.helpers.article = {};
			output.helpers.article.link = link;
			output.helpers.article.link_click = link_click;
			done();
		}
	};

	cb(null, helper);
};