var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var moment = require('moment');
var article_link = require('../../lib/article_link');
var folder_link = require('../../lib/folder_link');
var article_date = require('../../lib/article_date');
var ejs = require('ejs');

/* ************************************
 *
 * ************************************ */

/* ******* CLOSURE ********* */

function _folders_data(base) {
	return _.reduce(_.groupBy(base, 'folder'), function (out, arts, folder) {
		out.push({
			folder: folder,
			arts:   arts,
			count:  arts.length
		});
		return out;
	}, []);
}

var _template;

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	fs.readFile(
		path.resolve(__dirname, 'homepage_articles.html'),
		'utf8',
		function (err, txt) {
			_template = ejs.compile(txt);

			var helper = {

				name: 'homepage_article',

				test: function (ctx, output) {
					return output.use_homepage_article;
				},

				weight: 100,

				respond: function (ctx, output, done) {
					var arts = apiary.model('blog_article');
					if (!output.helpers) output.helpers = {};
					if (!output.helpers.article) output.helpers.article = {};
					arts.all(function (err, list) {
						function memoized_template_fn(params) {
							var my_list = list.slice(0);
							if (!params.all) {
								my_list = _.filter(my_list, function (art) {
									return art.on_homepage;
								});
							}
							if (params && params.folders) {
								my_list = _.filter(my_list, function (art) {
									return _.contains(params.folders, art.folder);
								})
							}

							my_list = _.sortBy(my_list, function (art) {
								return new Date(art.revised).getTime() * -1;
							})

							if (params.limit) {
								my_list = my_list.slice(0, params.limit);
							}

							var data = {
								article_link: article_link,
								folder_link: folder_link,
								article_date: article_date,
								articles:     my_list,
								folders:      _folders_data(my_list),
								all_folders:  _folders_data(list),
								count:        my_list.length,
								total_count:  list.length
							};

							if (params.template) {
								if (_.isString(params.template)) {
									return _.template(params.template)(data);
								} else {
									return params.template(data);
								}
							} else {
								var out = _template(data);
								return out;
							}
						};

						output.helpers.article.homepage_articles = memoized_template_fn;

						done();
					})
				}
			};

			cb(null, helper);
		})
};