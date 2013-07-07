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

			name: 'articles_menu',

			test: function (ctx, output) {
				console.log('layout name: %s', ctx.layout_name);
				return (output.layout_name == 'hiveblog') && output.helpers && output.helpers.sidebar_menu_data;
			},

			weight: 0,

			respond: function (ctx, output, done) {
				if (!output.helpers){
					output.helpers = {};
				}

				var article_model = apiary.model('blog_article');
				var member_model = apiary.model('member');

				article_model.articles_folders(function(err, folders){

					console.log('af: %s, %s', err, util.inspect(folders));

					var article_menu = new hm.Menu({
						name: 'articles',
						title: 'Articles',
						weight: 50,
						items: [
						]
					})

					folders.forEach(function(folder){
						article_menu.add({
							title : util.format('folder &quot;%s&quot;', folder),
							link: '/blog_folder/' + folder
						})
					})
					output.helpers.sidebar_menu_data.add(article_menu);

					member_model.ican(ctx, ['create article'], function(){
						article_menu.add({
							title: 'Create Article',
							link: '/admin/blog/create'
						});
						done();
					}, done);
				})
			}
		};

		cb(null, helper);

};