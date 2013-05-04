var _ = require('underscore');
var request = require('request');
var util = require('util');
var Gate = require('gate');
var jsdom = require('jsdom');
var async = require('async');

var s = 5;

var target_height = 80;

function imageData(src, href, w, h, text,  s, scale){
	w *= target_height/h;
	h = target_height;
	if (scale){
		w *= scale;
		h *= scale;
	}

	if (!s) s = 5;
	w = Math.round(w);
	h = Math.round(h);
	var out = {
		href: href,
		text: text,
		w:    w,
		ws:  w - (w % s),
		h:    h,
		hs:  h - (h % s),
		src:  src,
		wn: Math.floor(w/s),
		hn: Math.floor(h/s)
	}
	
	return out;
}

module.exports = {

	/* *********** GET RESPONSES ************** */

	on_get_validate: function (context, cb) {
		var self = this;

		cb();
	},

	on_get_input: function (context, cb) {
		var self = this;
		context.$out.set('s', s);
		context.$out.set('images', []);
		cb();
	},

	on_get_process: function (context, cb) {
		var self = this;

		cb();
	},

	on_get_output: function (context, cb) {
		var self = this;

		cb();
	},

	/* *********** PUT RESPONSES ************** */

	on_put_validate: function (context, cb) {
		var self = this;

		cb();
	},

	on_put_input: function (context, cb) {
		var self = this;

		cb();
	},

	on_put_process: function (context, cb) {
		var self = this;

		cb();
	},

	on_put_output: function (context, cb) {
		var self = this;

		cb();
	},

	/* *********** POST RESPONSES ************** */

	on_post_validate: function (context, cb) {
		var self = this;
		if (!context.query) return cb(new Error('no search term'));

		cb();
	},

	on_post_input: function (context, cb) {
		var self = this;

		context.$out.set('s', s);
		/**    request.get(url, function(err, r, body){
			
		}); */

		context.$out.set('images', []);
		var pages = context.pages || 1;
		var offset = context.offset || 0;
		var s = context.s || 5;
		context.$out.set('s', s);
		context.functions = _.map(_.range(0, pages), function (n) {

			var images = context.$out.get('images');

			return function (cb) {
				var url = 'http://www.google.com/search?q=' +
					context.query + '&btnG=Search&hl=en&site=imghp&tbm=isch&gbv=1';
				if (n || offset) {
					url += ( '&start=' + ( (n + (pages * offset)) * 20));
				}

				console.log('fetching %s', url);

				jsdom.env(
					url,
					["http://code.jquery.com/jquery.js"],
					function (errors, window) {

						window.$('table.images_table').find('td').each(function (i, td) {
							var link = window.$(td).find('a');
							var text = '';
							window.$(td).find('b').each(function(i, e){
								text += ' ' + window.$(e).text();
							});

							var l = window.$(link);
							var href = l.attr('href')
							//console.log('inner content: %s', util.inspect(link));

							var img = window.$(window.$(l).find('img'));

							var src = img.attr('src');
							var h = img.attr('height');
							var w = img.attr('width');

							images.push(imageData(src, href, w, h, text, s));

							switch(i % 10){
								case 0:
									images.push(imageData(src, href, w, h, text, s, 0.5));
									break;

								case 1:
									images.push(imageData(src, href, w, h,text,  s, 0.25));
									break;

								case 8:
									images.push(imageData(src, href, w, h,text,  s, 0.25));
									break;

								case 9:
									images.push(imageData(src, href, w, h, text, s, 0.5));
									break;

							}
						});

						
						cb();
					}

				);
			}
		});

		cb();
	},

	on_post_process: function (context, cb) {
		var self = this;

		async.parallel(context.functions, function () {
			//

			context.$out.set('images', _.sortBy(context.$out.get('images'), 'h'));
			cb();
		});
	},

	on_post_output: function (context, cb) {
		var self = this;

		if (/json$/.test(context.$req.url)) {
			context.$send(cb);
		} else {
			cb();
		}
	},

	/* *********** DELETE RESPONSES ************** */

	on_delete_validate: function (context, cb) {
		var self = this;

		cb();
	},

	on_delete_input: function (context, cb) {
		var self = this;

		cb();
	},

	on_delete_process: function (context, cb) {
		var self = this;

		cb();
	},

	on_delete_output: function (context, cb) {
		var self = this;

		cb();
	}


}