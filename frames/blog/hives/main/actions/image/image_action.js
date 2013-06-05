var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var IMAGES_FOLDER = path.resolve(__dirname, '../../../images');

/* ********* EXPORTS ******** */

module.exports = {

	on_get_validate: function (context, done) {
		var name = context.filename;
		if (!name) {
			done(new Error('no file ' + name));
		} else {
			context.file_path = path.resolve(IMAGES_FOLDER, name);
			fs.exists(context.file_path, function (e) {
				if (!e) {
					done(new Error('cannot find file ' + context.file_path));
				} else {
					done();
				}
			});
		}
	},

	on_get_output: function (context, done) {
		context.$sendfile(context.file_path, done);
	},

	on_put_validate: function (context, done) {
		if (!context.$req.files.image){
			done(new Error('no image file included'))
		} else if (!/^image\//.test(context.$req.files.image.type)){
			done(new Error('upload is not an image'))
		} else {
			done();
		}
	},

	on_put_input: function(context, done){
		context.write_path = path.resolve(IMAGES_FOLDER, context.iles.image.name);
		done();
	},

	on_put_process: function (context, done) {
		fs.copy(context.files.image.path, context.write_path, done);
	},

	on_put_output: function(context, done){
		context.$sendfile(context.write_path, done);
	}

}; // end action