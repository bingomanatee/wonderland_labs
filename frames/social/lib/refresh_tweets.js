var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

var Twitter = require('twitter');

/* ------------ CLOSURE --------------- */

/**
 *  the final exit point. returns all user's tweets.
 *  @TODO: ask for fewer fields
 *
 */
function return_tweets(user_id, tweets, done) {
    var query = {'user.id': parseInt(user_id)};

    tweets.find(query, done);
}

/**
 *
 * @param tweets {Mongoose_Model}
 * @param user_id {number}
 * @param config {object} twitter app auth
 * @param done {function} callback to return tweets to.
 * @param flush {boolean}
 */

function refresh_tweets(user_id, config, done, flush) {
    var tweets = this;
    var twitter = new Twitter(config);
    var max_id = null;

    function get_tweets() {
        var props = { 'user_id': user_id, count: 200, trim_user: true, include_entities: true};
        if (max_id) {
            props.max_id = max_id;
        }

        twitter.getUserTimeline(props,

            function (data) {
                if ((!data) || (!_.isArray(data)) || ( !data.length)) {
                    return return_tweets();
                }

                console.log('return count  from GUT: for max_id %s: %s',
                    max_id, util.inspect(data, true, 5));


                var ids = _.pluck(data, 'id');
                // set stage for polling older tweets
                max_id = _.min(ids) - 1;

                // add all found tweets, and see if any of them have already been saved.
                tweets.find({_id: {$in: ids}}, function (err, found) {
                    console.log('poll of old tweets: %s', found.length);

                    if (found.length > 0) {
                        var found_ids = _.pluck(found, '_id');

                        data = _.reject(data, function (t) {
                            return _.contains(found_ids, t._id);
                        });

                        data.forEach(function (t) {
                            t._id = t.id
                        });

                        // you may not have new tweets at this point
                        if (data.length) {
                            tweets.add(data, function () {
                                return_tweets(user_id, tweets, done);
                            }, true);
                        } else {
                            return_tweets(user_id, tweets, done);
                        }
                    } else {
                        data.forEach(function (t) {
                            t._id = t.id
                        });
                        tweets.add(data, get_tweets, true);
                    }
                });


            });
    }

    if (flush) {
        tweets.model.remove(query, get_tweets);
    } else {
        get_tweets(tweets, user_id);
    }

}

/* -------------- EXPORT --------------- */

module.exports = refresh_tweets