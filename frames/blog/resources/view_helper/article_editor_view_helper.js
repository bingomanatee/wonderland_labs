var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;


/* ************************************
 *
 * <link rel="stylesheet" type="text/css" href="/css/bootstrap-wysihtml5.css"></link>
 <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css"></link>
 <script src="js/wysihtml5-0.3.0.js"></script>
 <script src="js/jquery-1.7.2.min.js"></script>
 <script src="js/bootstrap.min.js"></script>
 <script src="js/bootstrap-wysihtml5.js"></script>
 *
 * ************************************ */

/* ******* CLOSURE ********* */

var ae_template;

function add_js(output) {
	var js = [
		{url: "/js/admin/vendor/jquery-1.10.1.min.js", "context": "head" },
		{url: '/js/blog/vendor/select2-3.4.0/select2.js', context: 'head'},
		{url: '/js/blog/vendor/angular/angular.min.js', context: 'head', require: ['jquery']},
		{url: '/js/blog/vendor/angular/select2.js', context: 'head', requires: ['angular']},
		{url: '/js/blog/vendor/angular/angular-resource.min.js', context: 'head', requires: ['angular']},
		{url: '/js/blog/vendor/angular/ui-bootstrap-tpls-0.5.0.min.js', context: 'head', requires: ['angular', 'bootstrap']},
		{url: '/js/blog/vendor/marked.js', context: 'head'},
		{url: '/js/blog/vendor/to-markdown.js', context: 'head'},
		{url: '/js/blog/vendor/prettydiff.js', context: 'head'},
		{url: '/js/blog/vendor/underscore-min.js', context: 'head'},
		{url: '/js/blog/vendor/bootstrap-fileupload/bootstrap-fileupload.js', context: 'head', defer:true},
		{url: '/js/blog/vendor/wysihtml5/wysihtml5-0.4.0pre.js', defer: true, context: 'head'},
		{url: '/js/blog/vendor/bootstrap-wysihtml5/bootstrap-wysihtml5-0.0.2.js', defer: true, context: 'head', requires:['wysi', 'bootstrap', 'jquery' ]},
		{url: '/js/blog/editor/controller.js', defer: true, context: 'head', requires: ['angular', 'underscore', 'bootstrap-wysihtml5', 'marked']}
	];

	if (output.javascript) {
		output.javascript.push.apply(output.javascript, js);
	} else {
		output.javascript = js;
	}
}

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	var helper = {

		test: function (ctx, output) {
			return output.article_editor;
		},

		weight: 0,

		respond: function (ctx, output, done) {
			var model = ctx.$action.model( "blog_article");

			if (!output.helpers) output.helpers = {};
			if (!output.helpers.article) output.helpers.article = {};

			fs.readFile(path.resolve(__dirname, 'article_editor.html'), 'utf8', function (err, template) {
				ae_template = _.template(template);
				model.articles_folders(function (err, folders) {
				output.helpers.article.editor = function (article) {
					return ae_template({article: article || {}, folders: folders });
				};

				console.log('set article.editor to function');

				add_js(output);
				done();
			})
		})
		}
	};

	cb(null, helper);
};