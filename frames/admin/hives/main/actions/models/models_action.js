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

module.exports = {

	on_validate: function (context, callback) {
		callback();
	},

	on_input: function (context, callback) {
		//console.log('action: %s', util.inspect(this._config, false, 1));
		var ds = this.get_config('apiary').dataspace;
		var models = _.map(_.keys(ds._config.data), function(n){
			return {name: n};
		});
		context.$out = models;
		context.$send(callback);
	}

}; // end action