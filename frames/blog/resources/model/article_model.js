var Mongoose_Model = require('hive-model-mongoose');

module.exports = function (apiary, cb) {

	Mongoose_Model(
		{
			name: 'article'
		}
		, {
			mongoose:   apiary.get_config('mongoose'),
			schema_def: {
			            title: 'string',
			            content: 'string',
			            blurb: 'string',
			            _articles: 'mixed'
			}
		},
		apiary.dataspace,
		cb);
};