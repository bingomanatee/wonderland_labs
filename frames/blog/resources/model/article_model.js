var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Gate = require('gate');
var util = require('util');
var moment = require('moment');

var ARTICLE_DIR = path.resolve(__dirname, '../../articles');

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
	/*
	 Mongoose_Model(
	 {
	 name: 'article'
	 }
	 , {
	 mongoose:   apiary.get_config('mongoose'),
	 schema_def: {
	 title: 'string',
	 content: 'string',
	 blurb: 'string',
	 _articles: 'mixed'
	 }
	 },
	 apiary.dataspace,
	 cb);
	 */

	var cache = {};

	var model = {
		name:        "blog_article",
		ARTICLE_DIR: ARTICLE_DIR,

		error: function (context) {
			if (!model.hasErrors(context)) {
				return null;
			}
			return new Error(_.first(_.values(context.$out.get('errors')[0])));
		},

		hasErrors: function (context) {
			var errors = context.$out.get('errors');
			return !!errors;
		},

		addError: function (context, error, field) {
			var errors = context.$out.get('errors') || {};
			errors[field] = error;
			context.$out.set('errors', errors);
			// note - because $out is a hive-config it will merge errors
		},

		exists: function (file_name, cb) {
			var full_path = path.resolve(ARTICLE_DIR, file_name + '.md');
			fs.exists(full_path, cb)
		},

		list: function (callback) {
			var al = _.map(cache, _.clone);
			return callback ? callback(null, al) : al;
		},

		get: function (file_name, cb) {
			var full_path = path.resolve(ARTICLE_DIR, file_name + '.md');
			fs.exists(full_path, function (ex) {
				if (!ex) {
					cb(new Error('cannot find file ' + file_name));
				} else {
					//@TODO: stream;
					fs.readFile(full_path, 'utf8', function (err, content) {
						var data = {
							file_name: file_name,
							content:   content
						};

						var meta_path = path.resolve(ARTICLE_DIR, file_name + '.json');
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

			function read_folder(folder, done) {
				fs.readdir(folder, function (err, files) {
					var json_files = _.filter(files, function (file) {
						return /\.json$/i.test(file);
					});

					cache = _.reduce(json_files, function (out, file) {
						var root_name = file.replace(/\.json$/, '');
						var file_root = path.resolve(folder, root_name + '.md');

						out[root_name] = {
							file_name: root_name,
							file_root: file_root,
							file_path: path.resolve(folder, root_name + '.md'),
							meta_path: path.resolve(folder, file)
						};
						return out;
					}, cache);

					var gate = Gate.create();

					_.each(cache, function (file_data) {

						var l = gate.latch();
						fs.readFile(file_data.meta_path, 'utf8', function (err, meta) {
							try {
								meta = JSON.parse(meta);
								_.extend(file_data, meta);
							} catch (err) {
							}
							l();
						})

					});

					var possible_folders = _.difference(files, json_files);

					_.each(possible_folders, function (poss_folder) {
						var pf_path = path.resolve(folder, poss_folder);
						var l = gate.latch();

						fs.stat(pf_path, function (err, stat) {
							if (stat && stat.isDirectory()) {
								read_folder(pf_path, l);
							} else {
								l()
							}
						})
					});

					gate.await(done);
				});
			}

			read_folder = _.bind(read_folder, this);

			read_folder(ARTICLE_DIR, done);

		},

		put: function (data, done) {
			var file_name = data.file_name.replace(/\.md$/, '');
			var folder = data.folder || '';
			var full_path = path.resolve(ARTICLE_DIR, folder, file_name + '.md');

			if (!data.revised) {
				data.revised = new Date();
			}

			data.revised = moment(data.revised).format('YYYY-MM-DD hh:mm');

			fs.writeFile(full_path, data.content, 'utf8', function () {
				delete(data.content);
				var meta_path = path.resolve(ARTICLE_DIR, folder, file_name + '.json');
				fs.writeFile(meta_path, JSON.stringify(data, true, 4), done);
				cache[file_name] = data;
			});
		}
	};

	model.init(function () {
		cb(null, model)
	});
};