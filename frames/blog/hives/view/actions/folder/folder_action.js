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
		cb(null, context);
	},

	on_get_process: function(context, cb){
		cb(null, context);
	},

	on_get_output: function(context, cb){
		var model = this.model('blog_article');
        if (!content.folder) content.folder = '';

		context.$out.set('moment', moment);
		context.$out.set('_', _);
		context.$out.set('folder', context.folder);
		model.folder_html(context.folder, function(err, html){

			context.$out.set('html',  html);
			cb();
		})
	}

}