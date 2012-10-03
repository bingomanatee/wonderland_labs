var tap = require('tap');
var util = require('util');

var wiki_links = require('./../node_modules/parsers/wiki_links');
var link_parts = require('./../node_modules/parsers/link_parts');

tap.test('finding links in text ', function(t){

    var text = "I have [[one_link]] and [[two_link:Two Links]] and [[three_links]] and \neven [[more_links:More Links]]"

    var links = wiki_links(text);
    var expected_links = [ '[[one_link]]',
        '[[two_link:Two Links]]',
        '[[three_links]]',
        '[[more_links:More Links]]' ]

    t.deepEqual(links, expected_links, 'found links');

    var parts = link_parts(expected_links);

 //   console.log('link parts: %s', util.inspect(parts));

    var p_expected = [ { name: 'one_link', original: '[[one_link]]', label: 'one link' },
        { name: 'two_link',
            original: '[[two_link:Two Links]]',
            label: 'Two Links' },
        { name: 'three_links',
            original: '[[three_links]]',
            label: 'three links' },
        { name: 'more_links',
            original: '[[more_links:More Links]]',
            label: 'More Links' } ];
    t.deepEqual(parts, p_expected, 'link parts')

    t.end();


})