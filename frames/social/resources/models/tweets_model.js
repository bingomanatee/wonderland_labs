var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Mongoose_Model = require('hive-model-mongoose');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: Get the record of tweets
 */

var tweets_schema = {
    _id: 'string',
    user: {id: 'number', name: 'string', screen_name: 'string'},
    screen_name: 'string',
    text: 'string',
    embed: 'string',
    created_at: 'date',
    entities: ['mixed']
};

/* -------------- EXPORT --------------- */

var model;

module.exports = function (apiary, cb) {

    if (model) return cb(null, model);

    var mongoose = apiary.get_config('mongoose');

  //  mongoose.set('debug', true);

        Mongoose_Model(
        {
            refresh_tweets: require('./../../lib/refresh_tweets.js'),
            name:           'social_tweets'
        }
            , {
            mongoose:   mongoose,
            schema_def: tweets_schema
        },
            apiary.dataspace,
            function (err, member_model) {
                model = member_model;
                cb(null, model);
            });

};