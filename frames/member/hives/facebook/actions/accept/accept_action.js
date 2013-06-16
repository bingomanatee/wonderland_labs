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

/* ********* EXPORTS ******** */

module.exports = {

	on_process: function (context, done) {
		var handler = passport.authenticate('facebook', {
			failureRedirect: '/?auth_failure=1'},
			function(req, res){
				console.log('req: %s', util.inspect(req));
				context.$go('/');
			}
		);
		handler(context.$req, context.$res, done)
	}

} // end action