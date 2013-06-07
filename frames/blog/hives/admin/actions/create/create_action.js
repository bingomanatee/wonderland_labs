var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

//@TODO: file_name in context - bury with '$'
module.exports = {

	on_output: function (context, done) {
		context.$out.set('article_editor', true);
		done();
	}

}; // end action