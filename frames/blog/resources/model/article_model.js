var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Gate = require('gate');
var util = require('util');
var moment = require('moment');
var folder_to_cache = require('article_model/folder_to_cache');

var ARTICLE_DIR;

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

function articles_folders(cb) {
	fs.readdir(ARTICLE_DIR, function (err, files) {
		var gate = Gate.create();
		var folders = [];

		if (err){
			return cb(err);
		}

		files.forEach(function (file) {
			var full_path = path.resolve(ARTICLE_DIR, file);
			var l = gate.latch();

			fs.stat(full_path, function (err, stat) {
				if (stat.isDirectory()) {
					folders.push(file);
				}
				l();
			})
		})

		gate.await(function () {
			console.log('done scanning %s, found %s', ARTICLE_DIR, folders.join(', '));

			cb(null, folders);
		})
	})
}
//var Mongoose_Model = require('hive-model-mongoose');

module.exports = function (apiary, cb) {

	if (apiary.has_config('article_root')){
		ARTICLE_DIR = path.resolve(apiary.get_config('root'), apiary.get_config('article_root'), 'articles');
		console.log('ARTICLE_DIR: %s', ARTICLE_DIR);
	} else {
		throw new Error('cannot find article_root in apiary config');
	}

	var cache = {};

	var model = {
		name:        "blog_article",
		ARTICLE_DIR: ARTICLE_DIR,

		articles_folders: articles_folders,

		clean_file_name: function (name) {
			return name.toLowerCase().replace(/[^\w]+/g, '_');
		},

		error: function (context) {
			if (!model.hasErrors(context)) {
				return null;
			}

			var errors = context.$out.get('errors');
			console.log('errors: %s', util.inspect(errors));
			var errs = _.flatten(_.values(errors));
			return new Error(errs[0]);
		},

		hasErrors: function (context) {
			var errors = context.$out.get('errors');
			return !!errors;
		},

		addError: function (context, error, field) {
			console.log('adding error to %s', util.inspect(context, false, 0));
			var errors = context.$out.get('errors') || {};
			errors[field] = error;
			context.$out.set('errors', errors);
			// note - because $out is a hive-config it will merge errors
		},

		exists: function (query, cb) {
			var full_path = this.query_file_path(query);
			fs.exists(full_path, cb)
		},

		list: function (callback) {
			var al = _.map(cache, _.clone);
			return callback ? callback(null, al) : al;
		},

		query_file_path: function (query) {
			if (query.folder) {
				return path.resolve(ARTICLE_DIR, query.folder, query.file_name + '.md');
			} else {
				return path.resolve(ARTICLE_DIR, query.file_name + '.md');
			}
		},

		query_json_path: function (query) {
			if (query.folder) {
				return path.resolve(ARTICLE_DIR, query.folder, query.file_name + '.json');
			} else {
				return path.resolve(ARTICLE_DIR, query.file_name + '.json');
			}
		},

		get: function (query, cb) {
			var full_path = this.query_file_path(query);
			console.log('looking for file %s', full_path);
			var self = this;
			fs.exists(full_path, function (ex) {
				if (!ex) {
					cb(new Error('cannot find file ' + query.file_name));
				} else {
					//@TODO: stream;
					fs.readFile(full_path, 'utf8', function (err, content) {
						var data = {
							file_name: query.file_name,
							content:   content
						};

						var meta_path = self.query_json_path(query);
						fs.exists(meta_path, function (e2) {
							if (e2) {
								fs.readFile(meta_path, 'utf8', function (err, content) {
									if (err) {
										cb(err);
									} else {
										try {
											var meta = JSON.parse(content);
											_.extend(meta, data);
											cb(null, meta);
										} catch (jerr) {
											cb(jerr);
										}
									}
								})
							} else {
								cb(new Error('cannot read meta ' + meta_path));
							}
						})
					});
				}
			});
		},

		init: function (done) {
			cache = {};
			folder_to_cache(ARTICLE_DIR, cache, done);
		},

		put: function (data, done) {
			var file_name = data.file_name.replace(/\.md$/, '');
			var folder = data.folder || '';
			var full_path = path.resolve(ARTICLE_DIR, folder, file_name + '.md');
			var root = path.resolve(ARTICLE_DIR, folder);

			if (!data.revised) {
				data.revised = new Date();
			}

			var revised = moment(data.revised);

			data.revised = revised.format('YYYY-MM-DD hh:mm');

			var backup_folder = path.resolve(root, '.backups');
			if (!fs.existsSync(backup_folder)) {
				fs.mkdirSync(backup_folder);
			}

			var date_suffix = revised.format('YYY-MMM-DDThh-mm');

			var backup_path = path.resolve(backup_folder, data.file_name + '.md.' + date_suffix);

			fs.writeFile(backup_path, data.content, function () {
				fs.writeFile(full_path, data.content, 'utf8', function () {
					delete(data.content);
					var meta_path = path.resolve(ARTICLE_DIR, folder, file_name + '.json');
					fs.writeFile(meta_path, JSON.stringify(data, true, 4), function () {
						var meta_path_bu = path.resolve(backup_folder, file_name + '.json.' + date_suffix);
						fs.writeFile(meta_path_bu, JSON.stringify(data, true, 4), function () {
							model.init(function () {
								done(null, data);
							});
						});
					});
				});
			});
		}
	};

	model.init(function () {
		cb(null, model)
	});
};