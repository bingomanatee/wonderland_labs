var _ = require('underscore');
var util = require('util');
var gate = require('gate');
var moment = require("moment");

module.exports = {

	/* *********** GET RESPONSES ************** */

	on_get_validate: function(context, cb){
		cb(null, context);
	},

	on_get_input: function(context, cb){
		context.$out.set('list_blog_articles', function(art){ return art.on_homepage });
		cb(null, context);
	},

	on_get_process: function(context, cb){
		cb(null, context);
	},

	on_get_output: function(context, cb){
		context.$out.set('moment', moment);
		context.$out.set('_', _);

		cb(null, context);
	}

}