var tap = require('tap');
var util = require('util');
var _ = require('underscore');

var NE = require('nuby-express');
var wiki_model_factory = require('./../resources/models/wiki_article_model');
var mongoose_factory = NE.deps.support.mongoose_factory;

var con = 'mongodb://localhost/wiki_link_test' + Math.floor(Math.random() * 100000 + .001);
NE.deps.mongoose.connect(con);

var _DEBUG = false;
var tests_done = 0;
var TEST_COUNT = 1;


function _try_drop() {
    if (++tests_done >= TEST_COUNT) {
        NE.deps.mongoose.connection.db.executeDbCommand({dropDatabase:1}, function (err, result) {
            console.log(err);
            console.log(result);
            process.exit(0);
        });
    }
}

tap.test('linking', function (t) {

    var wiki_model = wiki_model_factory(NE.deps.mongoose);

    function generator(index) {

        var alpha = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z'.split(',');
        var nn = Math.floor(index / 26);
        var a = alpha[index % 26];
        var name;
        if (nn > 0) {
            name = (a + '_' + nn)
        } else {
            name = a;
        }

        return {

            scope:'test',
            title:'Test ' + name,
            name:name,

            summary:'summary of ' + name,
            content:'content for ' + name
        }

    }

    mongoose_factory(wiki_model, generator, 5, function (err, arts) {

        wiki_model.article('test', 'c', function (err, article_c) {

            article_c.summary = 'a summary referrting to [[b]]';

            article_c.save(function () {

                wiki_model.link(article_c, function () {

                    wiki_model.article('test', 'a', function (err, article_a) {

                        article_a.content = 'link to [[b:Article b]], [[c]]';

                        article_a.save(function (err, saved) {
                            if (err) {
                                console.log('error: %s', err.message);
                                _try_drop();
                                t.end();
                            } else {

                                wiki_model.link(article_a, function () {

                                    wiki_model.article('test', 'b', function (err, art_b) {

                                        t.equal(art_b.linked_from.length, 2, 'two linked_from items in b');
                                        if (art_b.linked_from.length) {

                                            var las = _.sortBy(_.map(art_b.linked_from, function (lf) {
                                                return lf.name
                                            }), _.identity).join(',');

                                            t.equal(las, 'a,c', 'b is linked from a and c');
                                        }

                                        wiki_model.all(function (err, docs) {

                                            console.log('FINAL COLLECTION %s', util.inspect(docs, false, 4));
                                            _try_drop();
                                            t.end();
                                        })

                                    });
                                })
                            }
                        })
                    })
                })

            });

        })

    });

})