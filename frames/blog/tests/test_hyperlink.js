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

		t.equal(hyperlink_marked('my [[basicFile]] link', {})
			, 'my <a href="/blog/basicFile">basicFile</a> link', 'basic link');

		t.equal(hyperlink_marked('my [[basicFile]] link with [[another]] link', {})
			, 'my <a href="/blog/basicFile">basicFile</a> link with <a href="/blog/another">another</a> link', 'two links');

		t.equal(hyperlink_marked('my [[basicFile]](File Name) link', {})
			, 'my <a href="/blog/basicFile">File Name</a> link', 'a link with a name');

		t.equal(hyperlink_marked('my [[pathed/basicFile]](File Name) link', {})
			, 'my <a href="/blog/pathed/basicFile">File Name</a> link', 'a link with a name');

		t.end();
	}) // end tap.test 1
}