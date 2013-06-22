var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var mvc = require('hive-mvc');
var mongoose = require('mongoose');

var _DEBUG = false;

/* ***********************************************************************

 This test validates the functionality of the member model.
 It writes to a "temporary" database, which it deletes after completion.
 WARNING: failed tests will produce "JUNK" dbs in your mongoose instance.

 ************************************************************************* */

/* *********************** TEST SCAFFOLDING ********************* */

var dave_facebook_id = {
// note - temporarily cloaking provider for test purposes
// provider: 'facebook',
	id:          '805008941',
	username:    'dave.edelhart',
	displayName: 'Dave Edelhart',
	name:        { familyName: 'Edelhart',
		givenName:             'Dave',
		middleName:            undefined },
	gender:      'male',
	profileUrl:  'http://www.facebook.com/dave.edelhart',
	emails:      [
		{ value: undefined }
	],
	_raw:        '{"id":"805008941","name":"Dave Edelhart","first_name":"Dave","last_name":"Edelhart","link":"http:\\/\\/www.facebook.com\\/dave.edelhart","username":"dave.edelhart","about":"Attack of Happy Dave!","gender":"male","timezone":-7,"locale":"en_US","verified":true,"updated_time":"2013-06-15T17:32:41+0000"}',
	_json:       { id: '805008941',
		name:          'Dave Edelhart',
		first_name:    'Dave',
		last_name:     'Edelhart',
		link:          'http://www.facebook.com/dave.edelhart',
		username:      'dave.edelhart',
		about:         'Attack of Happy Dave!',
		gender:        'male',
		timezone:      -7,
		locale:        'en_US',
		verified:      true,
		updated_time:  '2013-06-15T17:32:41+0000' } };

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/* ************************* TESTS ****************************** */

if (true) {
	tap.test('test auth model', function (t) {

		var rand_number = Math.round(Math.random() * 10000000);
		var name = 'wll_model_test_' + rand_number;
		console.log('created database ..... %s', name);
		mongoose.connect('mongodb://localhost/' + name, function () {

			var apiary = mvc.Apiary({mongoose: mongoose}, path.resolve(__dirname, '../../'));

			apiary.init(function () {
				var member_model = apiary.model('member');

				/**
				 * validate that the record errors out without a provider ID
				 */
				member_model.get_from_oauth(dave_facebook_id, function (err, members) {

					t.equal(err.message, 'oauth must have provider', 'error for provider missing');

					var dfbid_typed = clone(dave_facebook_id);
					dfbid_typed.provider = 'facebook';

					/**
					 * validate that the record is not found.
					 */
					member_model.get_from_oauth(dfbid_typed, function (err, members) {

						t.ok(_.isNull(err), 'has no error');
						t.ok(_.isArray(members), 'member is an array');
						t.equal(members.length, 0, 'has no members');

						/**
						 * add the record - validate its fields
						 */
						member_model.add_from_oauth(dfbid_typed, function (err2, members2, multiple2) {

							console.log('err: %s, members: %s, mult: %s', err2, util.inspect(members2), multiple2);

							setTimeout(function () {

								t.ok(_.isNull(err2), 'has no error');
								t.ok(_.isArray(members2), 'member is an array');
								t.equal(members2.length, 1, 'has one member');
								var member = members2[0];
								var oauth = member.oauthProfiles[0];

								t.equal(oauth.displayName, 'Dave Edelhart', 'oauth displayName');
								t.equal(oauth.name.familyName, 'Edelhart', 'oauth familyName');
								t.equal(oauth._id, '805008941', 'oauth id');

								/**
								 * get the record again - validate that the record is now in the DB.
								 */
								member_model.get_from_oauth(dfbid_typed, function (err3, members3) {

									t.ok(_.isNull(err3), 'has no error');
									t.ok(_.isArray(members3), 'member is an array');
									t.equal(members3.length, 1, 'has one member');
									/*	var member = members3[0];
									 var oauth = member.oauthProfiles[0];

									 t.equal(oauth.displayName, 'Dave Edelhart', 'oauth displayName');
									 t.equal(oauth.name.familyName, 'Edelhart', 'oauth familyName');
									 t.equal(oauth._id, '805008941', 'oauth id'); */

									mongoose.connection.db.dropDatabase(function (err) {
										console.log('database %s dropped, err = %s', name, err);
										mongoose.disconnect(function () {
											t.end();
										})
									});
								}, 300);
							})
						})

					})
				})
			});
		});

	}); // end tap.test_auth_model
}

/**
 * this is a "follow up" test to examine if an added record exists
 */
if (false) {
	tap.test('test polling member', function (t) {

		var rand_number = 1345615; // Math.round(Math.random() * 10000000);
		var name = 'wll_model_test_' + rand_number;
		console.log('created database ..... %s', name);

		mongoose.connect('mongodb://localhost/' + name, function () {

			var apiary = mvc.Apiary({mongoose: mongoose}, path.resolve(__dirname, '../../'));

			apiary.init(function () {
				var member_model = apiary.model('member');
				var dfbid_typed = clone(dave_facebook_id);
				dfbid_typed.provider = 'facebook';

				/**
				 * validate that the record is found.
				 */
				member_model.get_from_oauth(dfbid_typed, function (err, members) {

					t.ok(_.isNull(err), 'has no error');
					t.ok(_.isArray(members), 'member is an array');
					t.equal(members.length, 1, 'has a member');

					return t.end();
					mongoose.connection.db.dropDatabase(function (err) {
						console.log('database %s dropped, err = %s', name, err);
						mongoose.disconnect(function () {
							t.end();
						})
					});
				}, 300);
			});
		});

	}); // end tap.test_auth_model
}