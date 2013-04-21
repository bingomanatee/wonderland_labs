var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

module.exports = {
	TYPE: 'Handler',

	core: require('./core'),

	handles: function (params) {
		if (this.name_filter().test(params.file)){
			if (_DEBUG){
				console.log('%s passed handler test %s', params.file_path, this.name_filter());
			}
			return true;
		} else {
			if (_DEBUG){
				console.log('%s failed handler test %s', params.file_path, this.name_filter());
			}
			return false;
		}
	},

	name_filter: function () {
		var name_filter = this.get_config('name_filter');
		if (!name_filter){
			throw new Error('no name filter');
		}
		if (_.isString(name_filter)) {
			name_filter = new RegExp(name_filter);
		} else if (_.isArray(name_filter)) {
			name_filter = new RegExp(name_filter[0], name_filter[1]);
		}

		return name_filter;
	},

	respond: function (params) {
		// override for custom behavior
	}

}