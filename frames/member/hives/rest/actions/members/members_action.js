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
//@TODO: examine security closer
module.exports = {

	/* *********** GET ********** */

	on_get_validate: function (context, callback) {
		callback();
	},

	on_get_input: function (context, done) {
		var model = this.model('member');
		model.all(function(err, members){
			if (err){
				done(err);
			} else {
				context.$send(_.map(members, function(member){
					return member.toJSON();
				}), done);
			}
		})
	},

	on_put_validate: function(context, done){
		if (!( context._id)){
			done(new Error('must have ID'))
		} else {
			done();
		}
	},

	on_put_input: function(context, done){
		var model = this.model('member');

		model.get(context._id, function(err, member){
			if (member){
					member.roles = context.roles || [];
					member.markModified('roles');
					member.save();
				context.$send(member.toJSON(), done);
			} else {
				done(new Error('cannot find member ' + context._id + ' of provider ' + context.provider));
			}
		});
	}

}; // end action