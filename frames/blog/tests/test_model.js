var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');

var _DEBUG = false;

var model_factory = require('./../resources/model/article_model');

/* *********************** TEST SCAFFOLDING ********************* */

/* ************************* TESTS ****************************** */

model_factory({}, function (err, article_model) {

	if (true) {
		tap.test('test parse', function (t) {
			var content = "this is\n" +
				"a story\n" +
				"about mice";
			var text = '#My Title' +
				"\n\n" +
				'<!--(my intro)-->' +
				"\n\n" +
				content;

			var data = {
				filename: 'mice',
				content:  text
			};

			var d2 = article_model.parse_data(data);

			t.equal(d2.title, 'My Title', 'title found');
			t.equal(d2.intro, 'my intro', 'intro found');
			t.equal(d2.content, content, 'content found');
			t.end();
		}) // end tap.test 1
	}

	if (false) {
		tap.test('test 2', function (t) {
			t.end();
		}) // end tap.test 2
	}

});