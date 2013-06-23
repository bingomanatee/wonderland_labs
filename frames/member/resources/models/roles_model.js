var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Mongoose_Model = require('hive-model-mongoose');

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

var roles_schema = require(path.resolve(__dirname, 'schema/member_role.json'));

console.log('roles schema: %s', util.inspect(roles_schema));

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {
	var mongoose = apiary.get_config('mongoose');
	var model;

	Mongoose_Model(
		{
			name:             'member_role',
			find_or_add_role: function (role, callback) {
				if (_.isString(role)) {
					role = {_id: role};
				} else if(role.name) {
					role._id = role.name;
				} else if (!role._id){
					throw new Error('bad role: no _id or name %s', util.inspect(role));
				}
				var self = this;
				this.get(role._id, function (err, foundrole) {
					if (foundrole) {
						if (role.actions){
							foundrole.actions = role.actions;
							foundrole.markModified('actions');
							foundrole.save(); // note - NOT waiting for response.
						}
						callback(null, foundrole);
					} else {
						self.put(role, callback);
					}
				})
			}
		}
		, {
			mongoose:   mongoose,
			schema_def: roles_schema
		},
		apiary.dataspace,
		function (err, role_model) {
			model = role_model;
			cb(null, model);
		});

}; // end export function