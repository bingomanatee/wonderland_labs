var request = require('request');
var util = require('util');
var Twitter = require('twitter');

var URL = 'https://api.twitter.com/1/statuses/oembed.json?id=%s';

module.exports = {

    twitter_config: function () {

        var apiary = this.get_config('apiary');

        return  {
            consumer_key: apiary.get_config('twitter_consumer_key'),
            consumer_secret: apiary.get_config('twitter_consumer_secret'),
            access_token_key: apiary.get_config('twitter_access_token'),
            access_token_secret: apiary.get_config('twitter_access_token_secret')
        };
    },

    on_input: function (context, done) {
        var twitter = new Twitter(this.twitter_config());

        var tweets = this.model('social_tweets');

        tweets.get(context.id, function (err, tweet) {
            if (!tweet){
                context.$send('<p>No tweet for id ' + context.id + '</p>', done);
            } else {
                context.tweet = tweet;
                console.log('tweet: %s', tweet);
                if (tweet.embed) {
                    context.$send(tweet.embed, done);
                } else {
                    twitter.get('/statuses/oembed.json', {id: context.id}, function (response) {
                       context.response = response;
                        done();
                    });

                }
            }
        });
    },

    on_process: function(context, done){
        console.log('response: %s', util.inspect(context.response));
        context.tweet.embed = context.response.html;
        context.tweet.save(done);
    },

    on_output: function (context, done) {
        context.$send(context.response.html, done);
    }
};