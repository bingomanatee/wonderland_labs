var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function article_to_data(context, auth_data){

	var tags = [];

	if (context.tags) {
		if (_.isString(context.tags)) {
			tags = context.tags.split(',')
		} else if (_.isArray(context.tags)){
			tags = context.tags;
		}
	}

	console.log('input: %s, homepage weight: %s', util.inspect(context, false, 0), context.on_homepage_weight);

	var out = {
		file_name:   context.file_name,
		title:       context.title,
		intro:       context.intro,
		content:     context.content,
		revised:     new Date(),
		tags:        tags,
		on_homepage: context.on_homepage || false,
		hide:        context.hide || false,
		folder:      context.folder || '',
		on_folder_homepage: context.on_folder_homepage || false,
		folder_homepage_weight: _.isNumber(context.folder_homepage_weight) ? parseInt(context.folder_homepage_weight) : 0
	};

	console.log('article input: %s', util.inspect(out));
	if (auth_data){
		out.author = auth_data;
	}

	return out;
}

/* ********* EXPORTS ******** */

module.exports = {

	on_get_validate: function (context, done) {
		var model = this.model('blog_article');
		if (!context.file_name) {
			return done();
		}
		context.file_name = model.clean_file_name(context.file_name);
		if (!context.file_name) {
			return done(new Error('file_name badly formatted'))
		}

		model.exists(context, function (ex) {

			if (context.exists) {
				context.$send({
					file_name: context.file_name,
					exists:    ex,
					folder:    context.folder
				}, done);
			} else if (ex) {
				done();
			} else {
				done(new Error('article ' + context.file_name + ' exists'));
			}
		});
	},

	on_get_input: function (context, done) {
		var model = this.model('blog_article');
		if (context.file_name) {
			if (context.exists) {
				context.$send({
					file_name: context.file_name,
					exists:    true,
					folder:    context.folder
				})
				model.exists(context, function (ex) {
				})
			} else {
				model.get(context, function (err, data) {
					if (err) {
						return done(err);
					}
					context.$send(data);
				});
			}
		} else {
			model.all(function (err, articles) {
				if (err) {
					done(err);
				} else {
					context.$send(articles, done);
				}
			});
		}
	},

	/* *************** POST **************** */

	on_post_validate: function (context, done) {
		var member_model = this.model('member');
		var self = this;
		member_model.ican(context, ["create article"], function () {

			var model = self.model('blog_article');
			if (!context.file_name) {
				return done(new Error('file_name required'))
			}
			context.file_name = model.clean_file_name(context.file_name);
			if (!context.file_name) {
				return done(new Error('file_name required'))
			}

			if (!context.title) {
				return done(new Error('no title'));
			}
			if (!context.content) {
				return done(new Error('no content'))
			}

			model.exists(context, function (ex) {
				if (ex) {
					done(new Error('article ' + context.file_name + ' exists'));
				} else {
					done();
				}
			});
		}, {
			go:      '/',
			message: 'You do not have permission to create articles',
			key:     'error'
		});
	},

	on_post_input: function (context, done) {
		var member = context.$session('member');
		var oauth = this.model('member').primary_oauth(member);
		var auth_data = {
			_id:         oauth._id,
			provider:    oauth.provider,
			displayName: oauth.displayName
		};

		context._data = article_to_data(context, auth_data);
		done();
	},

	on_post_process: function (context, done) {
		var model = this.model('blog_article');
		model.put(context._data, function (err, data) {
			context.$send(data, done);
		});
	},

	/* *************** PUT **************** */

	on_put_validate: function (context, done) {

		var member_model = this.model('member');
		var self = this;
		member_model.ican(context, ["create article"], function () {
		var model = self.model('blog_article');
		if (!context.file_name) {
			return done(new Error('file_name required'))
		}
		context.file_name = model.clean_file_name(context.file_name);
		if (!context.file_name) {
			return done(new Error('file_name required'))
		}

		if (!context.title) {
			return done(new Error('no title'));
		}
		if (!context.content) {
			return done(new Error('no content'))
		}

		done();
	}, {
			go:      '/',
			message: 'You do not have permission to update articles',
			key:     'error'
		});
	},

	on_put_input: function (context, done) {
		context._data = article_to_data(context);
		done();
	},

	on_put_process: function (context, done) {
		var model = this.model('blog_article');
		model.put(context._data, function (err, data) {
			console.log('article put: %s, %s', err, util.inspect(data));
			context.$send(data, done);
		});
		console.log('awaiting data %s', util.inspect(context._data))
	}

}; // end action