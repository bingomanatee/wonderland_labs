var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var moment = require('moment');
var ejs = require('ejs');
var hm = require('hive-menu');

/* ************************************
 *
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (apiary, cb) {

		var helper = {

			name: 'social_admin_menu',

			test: function (ctx, output) {
				return (output.layout_name == 'admin') &&  output.helpers && output.helpers.sidebar_menu_data;
			},

			weight: 0,

			respond: function (ctx, output, done) {
				if (!output.helpers){
					output.helpers = {};
				}

				var member_model = apiary.model('member');

                var social_menu = new hm.Menu({
                    name: 'social_content',
                    title: 'Social Content',
                    weight: 60,
                    items: [
                    ]
                });

                output.helpers.sidebar_menu_data.add(social_menu);

                member_model.ican(ctx, [
                    "view tweets",
                    "publish links"], function(){
					social_menu.add({
						title: 'Tweets',
						link: '/admin/tweets',
						weight: 0
					});
					done();
				}, done);

			}
		};

		cb(null, helper);

};