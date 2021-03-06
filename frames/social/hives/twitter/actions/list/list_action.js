var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var request = require('request');

/* ------------ CLOSURE --------------- */

/* -------------- EXPORT --------------- */

module.exports = {

    on_get_validate: function (context, done) {

        var member_model = this.model('member');

        member_model.find_one({
            'oauthProfiles._id': context.user_id, 'oauthProfiles.provider': 'twitter'
        }, function (err, member) {
            if (!member) {
                done('cannot find user ' + context.user_id);
            } else {
                done();
            }
        });
    },

    twitter_config: function () {

        var apiary = this.get_config('apiary');

        return  {
            consumer_key: apiary.get_config('twitter_consumer_key'),
            consumer_secret: apiary.get_config('twitter_consumer_secret'),
            access_token_key: apiary.get_config('twitter_access_token'),
            access_token_secret: apiary.get_config('twitter_access_token_secret')
        };
    },

    on_get_input: function (context, done) {

        var config = this.twitter_config();

        var tweets = this.model('social_tweets');

        tweets.refresh_tweets(context.user_id, config, done);

    },

    on_get_output: function (context, done) {

        var tweets = this.model('social_tweets');
        context.$res.write('[');

        var stream = tweets.model.find({'user.id': context.user_id}).stream();
        var count = 0;

        stream.on('data', function (tweet) {
            if (count > 0) {
                context.$res.write(',');
            }
            ++count;
            context.$res.write(JSON.stringify(tweet.toJSON()));
            console.log('written record %s', count);
        });

        stream.on('end', function () {
            context.$res.end(']');
            done('redirect');
        })

    }

};