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

			name: 'articles_admin_menu',

			test: function (ctx, output) {
				return (output.layout_name == 'admin') &&  output.helpers && output.helpers.sidebar_menu_data;
			},

			weight: 0,

			respond: function (ctx, output, done) {
				if (!output.helpers){
					output.helpers = {};
				}

				var article_menu = new hm.Menu({
					name: 'articles',
					title: 'Articles',
					weight: 50,
					items: [
					]
				});

				output.helpers.sidebar_menu_data.add(article_menu);

				var member_model = apiary.model('member');

				member_model.ican(ctx, ['create article', 'add folder'], function(){
					article_menu.add({
						title: 'Articles',
						link: '/admin/articles'
					});
					done();
				}, done);

			}
		};

		cb(null, helper);

};