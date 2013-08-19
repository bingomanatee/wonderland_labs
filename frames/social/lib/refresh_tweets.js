var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var Twitter = require('twitter');
var bigint = require('bigint');

/* ------------ CLOSURE --------------- */

/**
 *  the final exit point. returns all user's tweets.
 *  @TODO: ask for fewer fields
 *
 */

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

    function reconcile_found_and_new_tweets(err, saved_tweets, found_tweets) {
        if (err) {
            console.log('error: %s', err);
           return done(err);
        }
        console.log('saved_tweets: %s', saved_tweets.length);
        var saved_ids = _.pluck(saved_tweets, '_id');
        console.log('    ids: %s .... %s', util.inspect(saved_ids.slice(0, 3)), util.inspect(saved_ids.slice(saved_ids.length - 6)));
        var saved_text = _.pluck(saved_tweets, 'text').map(function (t) {
            return t.substr(0, 24)
        });
        console.log('    saved_text: %s .... %s', saved_text.slice(0, 3).join(', '), saved_text.slice(saved_text.length - 6).join(', '));

        if (saved_tweets.length > 0) {

            // don't save tweets alread cached
            found_tweets = _.reject(found_tweets, function (t) {
                return _.contains(saved_ids, t.id_str);
            });

            found_tweets.forEach(function (t) {
                t._id = t.id_str + '';
            });

            // you may not have new tweets at this point
            if (found_tweets.length) {
                tweets.add(found_tweets, done, true);
            } else {
               done();
            }
        } else {
            console.log('asking for tweets up to %s', max_id);
            // save found tweets, and ask for next lowest set
            found_tweets.forEach(function (t) {
                t._id = t.id_str
            });
            tweets.add(found_tweets, get_tweets, true);
        }
    }

    function process_tweets(found_tweets) {
        if (found_tweets.error) {
            console.log('error in found_tweets: %s', found_tweets.error);
           return done(found_tweets.error);
        }

        console.log('process_tweets return: %s tweets', found_tweets.length);
        if ((!found_tweets) || (!_.isArray(found_tweets)) || ( !found_tweets.length)) {
            console.log('no tweets returned from Twitter.');
            done();
        } else {
            console.log('return getUserTimeLine: (max %s): %s tweets', max_id, found_tweets.length);

            var ids = _.pluck(found_tweets, 'id_str');
            console.log('ids: %s .... %s', ids.slice(0, 3).join(', '), ids.slice(ids.length - 6).join(', '));
            var saved_text = _.pluck(found_tweets, 'text').map(function (t) {
                return t.substr(0, 24)
            });
            console.log('saved_text: %s .... %s', saved_text.slice(0, 3).join(', '), saved_text.slice(saved_text.length - 6).join(', '));
            // set stage for polling older tweets
            var low_id = ids.reduce(function (out, id) {
                id = bigint(id);
                if (!out) {
                    return id;
                } else if (id.cmp(out) < 0) {
                    return id;
                } else {
                    return out;
                }
            }, '');

            max_id = low_id.sub(1).toString();

            // see if we have pulled any tweets that are already in the database
            tweets.find({_id: {$in: ids}}, function (err, saved_tweets) {

                ids.splice(4, ids.length - 8, ['...']);
                console.log('found %s tweets with ids in %s', saved_tweets.length, util.inspect(ids));

                reconcile_found_and_new_tweets(err, saved_tweets, found_tweets);

            });
        }
    }

    function get_tweets() {
        var query = { 'user_id': user_id, count: 200, trim_user: true, include_entities: true};
        if (max_id) {
            query.max_id = max_id;
        }

        console.log('getting tweets whose id is <= %s', max_id);
        twitter.getUserTimeline(query, process_tweets);
    }

    if (flush) {
        tweets.model.remove(query, get_tweets);
    } else {
        get_tweets(tweets, user_id);
    }

}

/* -------------- EXPORT --------------- */

module.exports = refresh_tweets