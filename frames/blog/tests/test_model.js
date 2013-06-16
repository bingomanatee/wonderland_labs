var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var fs = require('fs');

var _DEBUG = false;

var folder_to_cache = require('./../resources/model/node_modules/article_model/folder_to_cache');

var model_factory = require('./../resources/model/article_model');

/* *********************** TEST SCAFFOLDING ********************* */

/* ************************* TESTS ****************************** */

if (false) {
	tap.test('article_model', function (t) {
		model_factory({}, function (err, article_model) {
		//	console.log('article model', article_model);

			t.end();
			// test 1
		});

	});
}

if (true) {
	tap.test('folder_to_cache', function (t) {
		var cache = {};

		var article_dir = path.resolve(__dirname, './../test_resources/test_2/article_dir');

		fs.exists(article_dir, function(ex){
			t.equals(ex, true, 'article_dir ' + article_dir + ' exists');
			folder_to_cache(article_dir, cache, function () {

				t.deepEqual(cache,  {
					"/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_alpha": {
						"file_name": "article_alpha",
						"file_root": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_alpha",
						"file_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_alpha.md",
						"meta_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_alpha.json",
						"title": "Alpha Article",
						"revised": "2013-06-07 05:24",
						"tags": [],
						"on_homepage": false,
						"hide": false,
						"folder": ""
					},
					"/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_beta": {
						"file_name": "article_beta",
						"file_root": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_beta",
						"file_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_beta.md",
						"meta_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/article_beta.json",
						"title": "Beta Article",
						"revised": "2013-06-07 05:24",
						"tags": [],
						"on_homepage": true,
						"hide": false,
						"folder": ""
					},
					"/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/blue": {
						"file_name": "blue",
						"file_root": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/blue",
						"file_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/blue.md",
						"meta_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/blue.json",
						"title": "Blue Article",
						"revised": "2013-06-07 05:24",
						"tags": [],
						"on_homepage": false,
						"hide": false,
						"folder": "color"
					},
					"/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/red": {
						"file_name": "red",
						"file_root": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/red",
						"file_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/red.md",
						"meta_path": "/Users/dedelhart/wll/wll/frames/blog/test_resources/test_2/article_dir/color/red.json",
						"title": "Red Article",
						"revised": "2013-06-07 05:24",
						"tags": [],
						"on_homepage": true,
						"hide": false,
						"folder": "color"
					}
				}, 'cache should be equivalent');
				t.end();

			})
		})
	}) // end tap.test 2
}
