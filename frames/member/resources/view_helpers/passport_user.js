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

module.exports = function (apiary, cb) {

	var helper = {
		name: 'passport_user',

		test: function (ctx, output) {
			return true;
		},

		weight: 100,

		respond: function (ctx, output, done) {
			if (!output.helpers) output.helpers = {};
			if (!output.helpers.member) output.helpers.member = {};

			output.helpers.member.member = ctx.$session('member', false);
			done();
		}
	}

	cb(null, helper);
}// end export function