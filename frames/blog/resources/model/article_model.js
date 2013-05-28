var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Gate = require('gate');

var ARTICLE_DIR = path.resolve(__dirname, '../../articles');


function getTitle(filepath, callback){
	var buffer = new Buffer(400);

	fs.open(filepath, 'r', function(err, fd){
		fs.read(fd, buffer, 0, 100, 0, function(){
			var s = buffer.toString();
			if (/^#.*/.test(s)){
				callback(null,  /^#(.*)/.exec(s)[1]);
			} else {
				callback(null,  s);
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

	var cache = [];

	var model = {
		name: "blog_article",

		exists: function (filename, cb) {
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.exists(full_path, cb)
		},

		list: function(callback){
			var al = _.map(cache, _.clone);
			return callback ? callback(null, al): al;
		},

		get:    function (filename, cb) {
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.exists(full_path, function (ex) {
				if (!ex) {
					cb(new Error('cannot find file ' + filename));
				} else {
					fs.readFile(full_path, 'utf8', function (err, content) {
						cb(null, {
							filename: filename,
							content: content
						});
					});
				}
			});
		},

		init: function(done){
			fs.readdir(ARTICLE_DIR, function(err, files){
				files = _.filter(files, function(file){
					return /\.md$/.test(file);
				})

				cache = _.map(files, function(file){
					return {
						filename: file,
						filepath: path.resolve(ARTICLE_DIR, file)
					};
				});

				var gate = Gate.create();

				cache.forEach(function(file_data){

					var l = gate.latch();
					getTitle(file_data.filepath, function(err, title){
						file_data.title = title;
						l();
					});

				});

				gate.await(done);
			});
		},

		put: function (filename, content, cb) {
			var full_path = path.resolve(ARTICLE_DIR, filename + '.md');
			fs.writeFile(full_path, content, 'utf8', function(){
				cache.push({filename: filename, filepath: full_path});
				cb();
			});
		}
	};

	model.init(function(){
		cb(null, model)
	});
};