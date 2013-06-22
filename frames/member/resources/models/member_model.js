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

var member_profile = require(path.resolve(__dirname, 'schema/member_profile'));
var oauth_user_profile = require(path.resolve(__dirname, 'schema/oauth_user_profile'));

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {
	var mongoose = apiary.get_config('mongoose');
	var model;
	member_profile.oauthProfiles = [new mongoose.Schema(oauth_user_profile)];

	/**
	 * fetches or creates a member record from oauth.
	 * Note, if more than one record is associated with the oAuth,
	 * an array is returned and the third parameter is true.
	 *
	 * @param oAuth {object}
	 * @param callback {function}(err, member(s), foundMultipleMembers)
	 */
	function add_from_oauth(oAuth, callback) {

		model.get_from_oauth(oAuth, function (err, oldMembers) {
			// @TODO: refresh data
			if (err) {
				callback(err);
			} else if (oldMembers && oldMembers.length) {
				if (oldMembers.length > 1) {
					callback(null, oldMembers[0], true);
				} else {
					callback(null, oldMembers);
				}
			} else {

				var id = oAuth._id ? oAuth._id : oAuth.id;
				oAuth._id = id;
				oAuth.primary = true;
				var data = {
					displayName:   oAuth.displayName,
					oauthProfiles: [oAuth]
				};

				model.put(data, function(err, member){
					if (member){
						member = [member];
					} else {
						member = [];
					}
					callback(err, member);
				});
			}
		});
	}

	function get_from_oauth(oAuth, callback) {
		var id = oAuth._id ? oAuth._id : oAuth.id;
		if (!oAuth.provider) {
			callback(new Error('oauth must have provider'));
		} else {
			var provider = oAuth.provider;
			var identity = {
				_id:  id,
				provider: provider};
			console.log('seeking identity %s', util.inspect(identity));

			this.find({
				oauthProfiles: {
					"$elemMatch": identity
				}
			}, callback)
		}
	}

	Mongoose_Model(
		{
			name:           'member',
			add_from_oauth: add_from_oauth,
			get_from_oauth: get_from_oauth
		}
		, {
			mongoose:   mongoose,
			schema_def: member_profile
		},
		apiary.dataspace,
		function (err, member_model) {
			model = member_model;
			cb(null, model);
		});

}; // end export function