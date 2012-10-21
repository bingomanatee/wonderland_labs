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
            _id: 'test:' + name,
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
                        if (err){
                            console.log('error finding article a: %s', err.message);
                            _try_drop();
                            return t.end();
                        }

                        article_a.content = 'link to [[b:Article b]], [[c]]';
                        wiki_model.link(article_a, function(err, article_a){

                            article_a.save(function (err, saved) {
                                if (err) {
                                    console.log('saving error: %s, %s', err.message);
                                    _try_drop();
                                    t.end();
                                    throw(err);
                                } else {

                                    wiki_model.article('test', 'a', function (err, art_a) {

                                        t.equal(art_a.link_to.length, 2, 'two link_to items in a');
                                        if (art_a.link_to.length) {

                                            var link_to_names = _.sortBy(_.map(art_a.link_to, function (lf) {
                                                return lf.name
                                            }), _.identity).join(',');

                                            t.equal(link_to_names, 'b,c', 'b is linked from a');
                                        }

                                        wiki_model.all(function (err, docs) {

                                            console.log('FINAL COLLECTION %s', util.inspect(docs, false, 4));
                                            _try_drop();
                                            t.end();
                                        })

                                    });
                                }
                            })

                        });

                    })
                })

            });

        })

    });

})