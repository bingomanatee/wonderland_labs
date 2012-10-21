var tap = require('tap');
var util = require('util');
var _ = require('underscore');

var NE = require('nuby-express');
var wiki_model_factory = require('./../resources/models/wiki_article_model');

var con = 'mongodb://localhost/wiki_link_test' + Math.floor(Math.random() * 100000 + .001);
NE.deps.mongoose.connect(con);
var wiki_model = wiki_model_factory(NE.deps.mongoose);

var _DEBUG = false;
var tests_done = 0;
var TEST_COUNT = 2;


function _try_drop() {
    if (++tests_done >= TEST_COUNT) {
        NE.deps.mongoose.connection.db.executeDbCommand({dropDatabase:1}, function (err, result) {
            console.log(err);
            console.log(result);
            NE.deps.mongoose.connection.close();
        ///    process.exit(0);
        });
    }
}

tap.test('custom id', function (t) {

    var article = {
        name: 'foo',
        scope: 'bar'
    }

    wiki_model.set_id(article);

    t.equals(article._id, 'bar:foo', 'setting of ID on object');

    wiki_model.put(article, function(err, art_model){

        t.equals(art_model._id, 'bar:foo', 'setting of ID on object');
        wiki_model.get('bar:foo', function(err2, am2){
            t.ok(am2, 'found bar:foo');
            _try_drop();
            t.end();
        })
    })

})

tap.test('custom id on document ', function(t){
    var article = new wiki_model.model({
        name: 'vey',
        scope: 'bar'
    });

    wiki_model.set_id(article);
    t.equals(article._id, 'bar:vey', 'setting of ID on object');

    wiki_model.put(article, function(err, art_model){

        t.equals(art_model._id, 'bar:vey', 'setting of ID on object');
        wiki_model.get('bar:vey', function(err2, am2){
            t.ok(am2, 'found bar:vey');
            _try_drop();
            t.end();
        })
    })
})