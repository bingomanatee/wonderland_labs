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

module.exports = function (apiary, cb) {

	var helper = {

		test: function (ctx, output) {
			return output.list_blog_articles;
		},

		weight: 0,

		respond: function (ctx, output, done) {
			var arts = apiary.model('blog_article');
			if (!output.helpers) output.helpers = {};
			if (!output.helpers.article) output.helpers.article = {};
			arts.all(function(err, list){
				if (_.isFunction(output.list_blog_articles)){
					list = _.filter(list, output.list_blog_articles);
				}
				output.blog_articles = list;
				done();
			})
		}
	};

	cb(null, helper);
};