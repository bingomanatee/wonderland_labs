var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var passport = require('passport');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var prop_defaults = {width: 200};

var _button = _.template('<fb:login-button show-faces="true" width="<%= width || 200 %>" max-rows="1"></fb:login-button>');
var _fb_init_script;

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

	var helper = {
		name: 'facebook_user',

		test: function (ctx, output) {
			return  true
		},

		weight: 0,

		respond: function (ctx, output, done) {
			if (!output.member) {
				output.member = { facebook: false};
			}

			if (!output.helpers) output.helpers = {};
			if (!output.helpers.member) output.helpers.member = {};

			console.log('passport is authenticated: %s', util.inspect(ctx.$req.isAuthenticated()));

			output.helpers.member.fb_script = function(){
				return _fb_init_script({
					fb_app_id: apiary.get_config('facebook_app_id'),
					domain_url: apiary.get_config('domain_url')
				})
			};

			output.helpers.member.fb_button = function (props) {
				return _button(props ? _.defaults(props, prop_defaults) : prop_defaults)
			};

			done();
		}
	};

	fs.readFile(path.resolve(__dirname, 'scripts/fb_init_script.js'), 'utf8', function(err, fbis_text){
		_fb_init_script = _.template(fbis_text);
		cb(null, helper);
	})
};