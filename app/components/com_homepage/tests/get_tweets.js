var tap = require('tap');
var options_model_factory = require('./../../com_admin/resources/models/site_options');
var Twit = require('twit');
var util = require('util');
var options_model = options_model_factory();
var _ = require('underscore');
var NE = require('nuby-express');

var mongoose_factory = NE.deps.support.mongoose_factory;

var con = 'mongodb://localhost/ne_bootstrap';
NE.deps.mongoose.connect(con);

tap.test('connect to twitter', function (t) {


    options_model.option_value([
        'twitter_consumer_key'
        , 'twitter_consumer_secret'
        , 'twitter_access_token',
        , 'twitter_access_token_secret'

    ], function (err, values) {
        console.log('values: %s', util.inspect(values));
        t.ok(values.twitter_consumer_key && values.twitter_consumer_key.length > 10, 'has ck');
        t.ok(values.twitter_consumer_secret && values.twitter_consumer_secret.length > 10, 'has cs');
        t.ok(values.twitter_access_token && values.twitter_access_token.length > 10, 'has at');
        t.ok(values.twitter_access_token_secret && values.twitter_access_token_secret.length > 10, 'has ass');
        NE.deps.mongoose.disconnect();

        var config = {};

        var tw = /^twitter_(.*)/;

        _.each(values, function (value, key) {
            console.log('key: %s, value: %s, ', key, value);
            if (tw.test(key)) {
                var k = tw.exec(key)[1];
                config[k] = value;
            }
        });


        var twit_conn = new Twit(config);
        twit_conn.get('search/tweets', {}, function (err, tweets) {
            console.log('err: %s, tweets: %s', err ? util.inspect(err) : '', util.inspect(tweets));

            t.end();
        });

    })

})

