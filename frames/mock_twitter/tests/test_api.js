var tap = require('tap');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var mvc = require('hive-mvc');

var _DEBUG = false;

/* *********************** TEST SCAFFOLDING ********************* */

/* ************************* TESTS ****************************** */

var apiary = mvc.Apiary({}, path.resolve(__dirname, '../../'));

apiary.set_config('frame_filter', ['mock_twitter']);

apiary.init(function () {

    tap.test('api', function (api_test) {

        var mock_tweets = apiary.model('mock_tweets');

        api_test.test('create a tweet', function (create_test) {

            mock_tweets.empty();

            mock_tweets.put_tweet({user: 'bob', status: 'i am bob'}, function (err, tweet) {

                function _examine_tweet(tweet) {
                    tweet = _.clone(tweet);

                    var time = tweet.created;
                    delete tweet.created;
                    var user_id = tweet.user_id;
                    delete tweet.user_id;
                    create_test.ok(_.isNumber(user_id), 'user id is a number');

                    var id = tweet.id;
                    delete tweet.id;
                    create_test.ok(_.isNumber(id), 'id is a number');

                    api_test.ok(time > 0, 'has a time');
                    api_test.deepEqual(tweet, {user: 'bob', text: 'i am bob'});
                };

                _examine_tweet(tweet);

                mock_tweets.get_tweets({user: 'bob'}, function (err, tweets) {

                    create_test.equals(tweets.length, 1, 'has a single tweet');

                    _examine_tweet(tweets[0]);

                    mock_tweets.put_tweet({user: 'bob', status: 'I ate food'}, function (err, tweet) {

                        mock_tweets.get_tweets({user: 'bob'}, function (err, tweets) {
                            console.log('my tweets: %s', util.inspect(tweets));

                            create_test.equal(tweets.length, 2, 'two tweets');
                            create_test.end();
                        })

                    });
                });

            });

        })

    });
});