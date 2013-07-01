var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var moment = require('moment');
var ejs = require('ejs');

/* ************************************
 *
 * ************************************ */
console.log('found hive_blog_menu');

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	var helper = {

		name: 'hive_blog_layout_menu',

		test: function (ctx, output) {
			console.log('testing %s for layout_name hive_blog', util.inspect(output));
			return output.layout_name == 'hiveblog';
		},

		weight: 50,

		respond: function (ctx, output, done) {
			if (!output.helpers){
				output.helpers = {};
			}

			output.helpers.sidebar_menu = function(){
				return '<h2>Menu</h2>';
			};
			done();
		}
	};

	cb(null, helper);
};