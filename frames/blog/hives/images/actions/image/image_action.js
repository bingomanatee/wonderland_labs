var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var _DEBUG = false;
var Canvas = require('canvas');
var im = require('imagemagick');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var IMAGES_FOLDER = path.resolve(__dirname, '../../../../images');

function send_thumb(context, thumb_path, done) {

//	console.log('working on file path %s for %s x %s', context.file_path, context.width, context.height);
	im.identify(context.file_path, function (err, info) {
		if (err) {
			done(err);
		} else {
			fs.readFile(context.file_path, function (err, src) {
				if (err) {
					done(err);
				} else {
				//	console.log('making thumbnail for %s', thumb_path);
					var img = new Canvas.Image();
					img.src = src;
					var w = parseInt(context.width);
					var h = parseInt(context.height);
					//console.log('making canvas %s x %s', w, h);

					var canvas = new Canvas(w, h);

					var ctx = canvas.getContext('2d');
					ctx.fillStyle='red';
					ctx.rect(0,0,w, h);
					ctx.fill();

					var scale = Math.max(w/info.width, h/info.height) * 1.2;

					var iw = scale * info.width;
					var ih = scale * info.height;
					var x = (w - iw)/2;
					var y = (h - ih)/2;
				//	console.log('scale: %s, i %s x %s', scale, iw, ih);
					ctx.drawImage(img, x, y, iw, ih);

					var handle = fs.createWriteStream(thumb_path);

					var stream = canvas.pngStream();
					stream.pipe(handle);

					stream.on('end', function () {
						console.log('done writing data to %s', thumb_path);
						setTimeout(function(){
							context.$sendfile(thumb_path, done);
						}, 500);
					})
				}
			});
		}
	})
}

/* ********* EXPORTS ******** */

module.exports = {

	on_get_validate: function (context, done) {
		var name = context.filename;
		console.log('getting image %s', name);
		if (/\{/.test(name)){
			context.$go('/img/blog/placeholder.gif', done);
		}else	if (name) {
			context.file_path = path.resolve(IMAGES_FOLDER, name);
			fs.exists(context.file_path, function (e) {
				if (!e) {
					done(new Error('cannot find file ' + context.file_path));
				} else {
					done();
				}
			});
		} else {
			done();
		}
	},

	on_get_process: function (context, done) {
		if (!context.filename) {
			fs.readdir(IMAGES_FOLDER, function (err, files) {
				files = _.filter(files, function (file) {
					return /(png|gif|jpg)$/.test(file);
				})
				context.$send(_.map(files, function (file) {
					return {name: file};
				}), done);
			})
		} else if (context.width) {
			var thumb_path = context.file_path + '.' + context.width + '.' + context.height;
			fs.exists(thumb_path, function (ex) {
				if (ex) {
					context.file_path = thumb_path;
					done();
				} else {
					send_thumb(context, thumb_path, done);
				}
			});
		} else {
			done();
		}
	},

	on_get_output: function (context, done) {
		if (context.filename) {
			context.$sendfile(context.file_path, done);
		}
	},

	on_post_validate: function (context, done) {
		console.log('request: %s', util.inspect(context.$req));
		if (!context.$req.files.image) {
			done(new Error('no image file included'))
		} else if (!/^image\//.test(context.$req.files.image.type)) {
			done(new Error('upload is not an image'))
		} else {
			done();
		}
	},

	on_post_input: function (context, done) {
		context.image_file_data = context.$req.files.image;
		context.write_path = path.resolve(IMAGES_FOLDER, context.image_file_data.name);
		done();
	},

	on_post_process: function (context, done) {
		console.log('copying %s to %s', context.image_file_data.path, context.write_path);
		fs.copy(context.image_file_data.path, context.write_path, done);
	},

	on_post_output: function (context, done) {
		context.$sendfile(context.write_path, done);
	}

}; // end action