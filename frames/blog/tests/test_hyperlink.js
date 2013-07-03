var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var hyperlink_marked = require(path.resolve(__dirname, '../lib/hyperlink_marked'));
var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */

/* ************************* TESTS ****************************** */

if (true) {
	tap.test('test hyperlinks', function (t) {

		t.equal(hyperlink_marked('my ?[File Name](basicFile) link', {folder: ''})
			, 'my <a href="/blog/basicFile">File Name</a> link', 'a link with a name');

		t.equal(hyperlink_marked('my ?[File Name](pathed/basicFile) link', {folder: ''})
			, 'my <a href="/blog/pathed/basicFile">File Name</a> link', 'a link with a name');

		t.equal(hyperlink_marked('my ?[File Name](basicFile) link', {folder: 'baseFolder'})
			, 'my <a href="/blog/baseFolder/basicFile">File Name</a> link', 'a link with a name');

		t.equal(hyperlink_marked('my ?[File Name](pathed/basicFile) link', {folder: 'baseFolder'})
			, 'my <a href="/blog/pathed/basicFile">File Name</a> link', 'a link with a name');

		t.end();
	}) // end tap.test 1
}