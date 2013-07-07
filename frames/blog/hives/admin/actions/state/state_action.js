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

module.exports = {

	on_validate: function (context, callback) {
		var member_model = this.model('member');
		member_model.ican(context, ['add folder'], callback, {
			go: '/',
			message: 'You do not have authorization to administer folders',
			key: 'error'
		});
	},

	on_input: function (context, callback) {
		callback();
	},

	on_process: function (context, callback) {
		callback();
	}

} // end action