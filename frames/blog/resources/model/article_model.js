var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Gate = require('gate');
var util = require('util');
var moment = require('moment');
var folder_to_cache = require('article_model/folder_to_cache');
var article_dir = require('article_model/article_dir');
var articles_folders = require('article_model/articles_folders');

function getTitle(filepath, callback) {
	var buffer = new Buffer(400);

	fs.open(filepath, 'r', function (err, fd) {
		fs.read(fd, buffer, 0, 100, 0, function () {
			var s = buffer.toString();
			if (/^#.*/.test(s)) {
				callback(null, /^#(.*)/.exec(s)[1]);
			} else {
				callback(null, s);
			}
		})
	});
}

//var Mongoose_Model = require('hive-model-mongoose');

module.exports = function (apiary, cb) {

	var cache = {};

	var model = {
		name:        "blog_article",
		ARTICLE_DIR: article_dir(apiary),

		articles_folders: articles_folders,

		add_folder: require('article_model/add_folder'),

		article_html: require('article_model/article_html'),

		clean_file_name: function (name) {
			return name.toLowerCase().replace(/[^\w]+/g, '_');
		},

		exists: function (query, cb) {
			var full_path = this.query_file_path(query);
			fs.exists(full_path, cb)
		},

		all: function (callback) {
			var al = _.map(cache, _.clone);
			return callback ? callback(null, al) : al;
		},

		query_file_path: function (query) {
			if (query.folder) {
				return path.resolve(article_dir(), query.folder, query.file_name + '.md');
			} else {
				return path.resolve(article_dir(), query.file_name + '.md');
			}
		},

		query_json_path: function (query) {
			if (query.folder) {
				return path.resolve(article_dir(), query.folder, query.file_name + '.json');
			} else {
				return path.resolve(article_dir(), query.file_name + '.json');
			}
		},

		get: require('article_model/get'),

		init: function (done) {
			cache = {};
			folder_to_cache(article_dir(), cache, done);
		},

		put: require('article_model/put'),

		folder_articles: function(folder){
			return _.filter(this.all(), function(a){
				return a.folder == folder;
			})
		},

		folder_html: require('article_model/folder_html')
	};

	model.init(function () {
		cb(null, model)
	});
};