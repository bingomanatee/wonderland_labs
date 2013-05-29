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
		name: "blog_article",

		error: function (context) {
			if (!model.hasErrors(context)) {
				return null;
			}
			return new Error(context.$out.get('errors')[0]);
		},

		hasErrors: function (context) {
			var errors = context.$out.get('errors');
			if (!errors) {
				return false;
			} else {
				return errors.length;
			}
		},

		addError: function (context, error) {
			var errors = context.$out.get('errors', []) || [];

			errors.push(error);
			context.$out.set('errors', errors);
		},

		exists: function (filename, cb) {
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.exists(full_path, cb)
		},

		list: function (callback) {
			var al = _.map(cache, _.clone);
			return callback ? callback(null, al) : al;
		},

		parse_data: function (data) {

			var title_test = /^#(.*)[\n]*/m;
			if (title_test.test(data.content)) {
				var m = title_test.exec(data.content);
				data.title = m[1];
				data.content = data.content.replace(title_test, '');
			}

			var intro_test = /<!--\(([^>]*)\)-->[\n]*/m;
			if (intro_test.test(data.content)) {
				var m2 = intro_test.exec(data.content);
			//	console.log('m2: ', util.inspect(m2));
				data.intro = m2[1];
				data.content = data.content.replace(intro_test, '');
			}


			var rs_re = /<time class="revised">([^<]+)<\/time>/;

			if (rs_re.test(data.content)){
				var m3 = rs_re.exec(data.content);
				data.revised = m3[1];
			}

			return data;
		},

		get: function (filename, cb) {
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.exists(full_path, function (ex) {
				if (!ex) {
					cb(new Error('cannot find file ' + filename));
				} else {
					fs.readFile(full_path, 'utf8', function (err, content) {
						var data = {
							filename: filename,
							content:  content
						};

						cb(null, model.parse_data(data));
					});
				}
			});
		},

		init: function (done) {
			fs.readdir(ARTICLE_DIR, function (err, files) {
				files = _.filter(files, function (file) {
					return /\.md$/.test(file);
				})

				cache = _.reduce(files, function (out, file) {
					filename = file.replace(/\.md$/, '');

					out[filename] = {
						filename: filename,
						filepath: path.resolve(ARTICLE_DIR, file)
					};
					return out;
				}, {});

				var gate = Gate.create();

				_.each(cache, function (file_data) {

					var l = gate.latch();
					fs.readFile(file_data.filepath, 'utf8', function (err, content) {
						file_data.content = content;
						model.parse_data(file_data);
						delete file_data.content;
						l();
					})

				});

				gate.await(done);
			});
		},

		update_cache: function (filename, done) {
			filename = filename.replace(/\.md$/, '');
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			var file_data = {
				filename: filename,
				filepath: full_path
			};
			fs.readFile(full_path, 'utf8', function (err, content) {
				file_data.content = content;
				model.parse_data(file_data);
				delete file_data.content;
				cache[filename] = file_data;
				done();
			})
		},

		make_content: function (context) {
			return context.filename, '#' + context.title + "\n\n"
				+ '<!--(' + context.intro + ')-->' + "\n\n"
				+ context.content;
		},

		revise_stamp: function(content){
			var rs_re = /<time class="revised">[^<]+<\/time>/g;

		 content =	content.replace(rs_re, '');
			content += "\n<time class=\"revised\">" + moment().format('YYYY-MM-DD hh:mm') + '</time>';
			return content;

		},

		put: function (filename, content, done) {
			content = model.revise_stamp(content);

			filename = filename.replace(/\.md$/, '');
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.writeFile(full_path, content, 'utf8', function () {
				model.update_cache(filename, done);
			});
		}
	};

	model.init(function () {
		cb(null, model)
	});
};