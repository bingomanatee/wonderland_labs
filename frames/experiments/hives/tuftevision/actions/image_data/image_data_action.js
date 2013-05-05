var _ = require('underscore');
var util = require('util');
var gate = require('gate');
var jsdom = require('jsdom');
var request = require('request');

module.exports = {

	/* *********** GET RESPONSES ************** */

	on_get_validate: function(context, cb){
		var self = this;

		cb();
	},

	on_get_input: function(context, cb){
		var self = this;

		cb();
	},

	on_get_process: function(context, cb){
		var self = this;

		cb();
	},

	on_get_output: function(context, cb){
		var self = this;

		cb();
	},

	/* *********** POST RESPONSES ************** */

	on_post_validate: function(context, cb){
		var self = this;

		cb();
	},

	on_post_input: function(context, cb){
		var self = this;
		var url = 'http://images.google.com/' + context.src;
	/*	console.log('getting image data %s,', url);
		context.$out.set('url', url);
		request.get(url, function(err, res, body){
			console.log('body: %s', body);
			 context.$out.set('body', body);
			cb();
		});*/

		jsdom.env(
			url,
			["http://code.jquery.com/jquery.js"],
			function (errors, window) {
				context.window = window;
				cb(errors);
			});
	},

	on_post_process: function(context, cb){
		var self = this;


		var data = {};
		var window = context.window;
		window.$('.il_t').find('td').each(function(i, e){
			switch(i){
				case 0:
					var text = window.$(e).text().toString().replace(/[\D]+/,',');
					var match = text.split(',');
					console.log('text: "%s", match: %s', text, util.inspect(match));
					data.w = match ? parseInt(match[0]) : 0;
					data.h = match ? parseInt(match[1]) : 0;
				break;

				case 1:
					var stats = window.$(e).text().split(' ');
					data.size = stats[0];
					data.type = stats[1];
			}
		});

		var url = window.$('.il_ul a').attr('href');

		context.$out.set('img_url', url);
		context.$out.set('data', data);
		context.$send(cb);
	}

}