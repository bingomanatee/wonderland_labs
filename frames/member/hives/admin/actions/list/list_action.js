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
		//@TODO: secure page
		callback();
	},

	on_input: function (context, callback) {
		var member_role_model = this.model('member_role');
		var member_action_model = this.model('member_action');

		member_action_model.all(function(err, actions){
			context.$out.set('member_actions', actions);
			member_role_model.all(function(err, roles){
				context.$out.set('member_roles', roles);
				callback();
			})
		});
	}

}; // end action