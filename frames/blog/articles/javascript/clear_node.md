Node has no enforced code standards of project organization. However there are patterns of module organization that can result in readable, editable code, and there are patterns that result in "did I write this" nausea every time you re-read your own source -- or anyone else gives it a go. 

Here are a few tricks I've found for making Node code readable. 

## Spread your code into multiple files

At a minimum, creating one file for each class will increase comprehension. But it isn't necessary to put all of the classes' code in a single file. 

consider this, taken from the core of [hive-component](hive/hive_component): 

``` javascript

var _ = require('underscore');
var events = require('events');
var util = require('util');
var fs = require('fs');
var path = require('path');
var _DEBUG = false;

var _id = 0;
function Component(extend, config, cb) {
	this.extend(extend);
	this.component_id = ++_id;
	var self = this;
	this.config(config, function (err, config) {
		if (cb) {
			cb(err, self)
                }
	});
};

util.inherits(Component, events.EventEmitter);

_.extend(Component.prototype, {

	extend: require('./extend'),

	_params: require('./params'),

	init: require('./init'),

	TYPE: 'HIVE_COMPONENT',

	// ****************** CONFIGURE *******************

	config: require('./config'),

	get_config: function (key, def) {
		if (!this.has_config(key)){
			return def;
		}
		return this.config().get(key);
	},

	set_config: function (key, value) {
		return this.config().set(key, value);
	},

	has_config: function(key){
		return this.config().has(key)
	}

})

module.exports = Component

```

This source would be fairly dense if each method were embedded in the prototype.

Unlike Javascript, there is a very minute cost to loading code from multiple files. Put long functions into their own files wherever possible.

## Take advantage of the fact that you can `require()` JSON

If you have large, static configuration blocks, put them into a JSON file and `require()` them into your source code. 
This pulls a lot of sprawl out of your source. 

## Pull as much as you can out of the exported function into closure space (or requires). 

There is no coding advantage -- and every disadvantage -- to anonymous functions and embedded tokens. 
Node doesn't benefit from content compression so extract your tokens from the body of your code into named variables and fucntions. 

Compare 

``` javascript
var async = require('async');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

module.exports = function (context, output_callback) {

	var method = context.$req.method.toLowerCase();
	var self = this;


	var respond_wf = _.map(['validate', 'input', 'process', 'output'], function (fname) {
		var method_name = util.format('on_%s_%s', method, fname);
		var f = function (ctx, cb) {
			cb();
		};

		if (self[method_name]) {
			f = self[method_name];
		} else {
			method_name = util.format('on_%s', fname);
			if (self[method_name]) {
				f = self[method_name];
			}
		}

		f = _.bind(f, self);

		return function (cb) {
			var args = _.toArray(arguments);

			f(context, cb);
		}

	});

	async.waterfall(respond_wf, function (err) {
		if (err && _.isString(err)) {
			err = new Error(err);
		}
		output_callback(err);
	});
};
```

Compare this to 

``` javascript

var async = require('async');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _default_pipes = ['validate', 'input', 'process', 'output'];

function make_waterfall(method, fname, context) {
	var f = function (ctx, cb) {
		cb();
	};

	var method_name = util.format('on_%s_%s', method, fname);
	
	if (this[method_name]) {
		f = this[method_name];
	} else {
		method_name = util.format('on_%s', fname);
		if (this[method_name]) {
			f = this[method_name];
		}
	}

	var self = this;

	return function (cb) {
		f.call(self, context, cb);
	}

}

module.exports = function (context, output_callback) {

	var method = context.$req.method.toLowerCase();

	var respond_wf = _.map(_default_pipes, function(fname){
	    _.bind(make_waterfall, this)(method, fname, context);
	}, this);

	async.waterfall(respond_wf, function (err) {
		if (err && _.isString(err)) {
			err = new Error(err);
		}
		output_callback(err);
	});
};

```

You now have one small function with the overall strategy, and one closure-contained function that implements the messy
part of the code. 

## If you think there might be a module for that, there is probably a module for that. 

Avoid recoding fundamental operations or accessors to popular systems like git or imagemagick. There are an amazing number of modules out there for handling common activity and libraries.

When it comes to fancy operations on objects and arrays, [Underscore](http://underscorejs.org/) has a wealth of utility classes. 

This is especially true of asynchronous patterns; the [async](https://github.com/caolan/async) and [gate](https://github.com/nakamura-to/gate) modules, for starters, are good places to look for process management patterns. 

Tasks like oAuth logins are well handled by [passport.js](http://passportjs.org/); why write your own gateway to an identity provider when they have encapsulated all the handshaking already?

There are dozens of excellent templating systems -- EJS, Jade, not Handlebar; even a basic EJS like system in Underscore. It's not likely that you will get anything out a handmade system that you wrote yourself that you can't get from a well-evolved middleware package.

## If there isn't a module for that, make one

This is the "Substack rule": If you find yourself tackling a larger project, split it up into submodules. Few large project can't be extracted into independent components.