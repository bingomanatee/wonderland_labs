var util = require('util');
var _ = require('underscore');

module.exports = function (apiary, cb) {

    var users = {___start: -1};

    var mock_tweets = apiary.Model({name: 'mock_tweets', _pk: 'id',

            as_id: function(item){
                if (_.isNumber(item)){
                    return item;
                }  else if (_.isObject(item) && item.hasOwnProperty('id')){
                    return item.id;
                } else if (this.data.length) {
                    return _.max(_.pluck(this.data, 'id')) + 1;
                } else {
                    return 1;
                }
            },
            get_tweets: function (query, callback) {
                console.log('tweets: %s', util.inspect(this.data));

                if (!(query.user || query.user_id)) {
                    callback({error: 'Must include user or user_id'});
                } else {
                    this.find(function (tweet) {

                        console.log('examining %s against %s', util.inspect(tweet), util.inspect(query));
                        return tweet.user == query.user || tweet.user_id == query.user_id;
                    })
                        .sort('time', true)
                        .records(function (err, records) {
                            callback(null, records.slice(0, query.count ? Math.min(query.count, 200) : 200));
                        })
                }
            },

            put_tweet: function(tweet, callback){
                if (!tweet.hasOwnProperty('status')) return callback('tweet must have status');
                tweet.text = tweet.status;
                delete tweet.status;
                if (!users.hasOwnProperty(tweet.user)){
                    users[tweet.user] = _.max(_.values(users)) + 1;
                }
                 tweet = _.extend({user_id: users[tweet.user], created: new Date().getTime()}, tweet);
                this.put(tweet, callback || _.identity);
            }

        }, {}
    );

    cb(null, mock_tweets);
}