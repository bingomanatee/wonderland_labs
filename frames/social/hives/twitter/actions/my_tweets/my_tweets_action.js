var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var request = require('request');

var Twitter = require('twitter');

/* ------------ CLOSURE --------------- */

/* -------------- EXPORT --------------- */

module.exports = {

    on_get_validate: function (context, done) {
        var member = context.$session('member');

        if (!member){
            context.add_message('You must be logged in with a twitter account to see your tweets', 'error');
            context.$go('/', done);
            return;
        }

        var twitter_id = _.find(member.oauthProfiles, function(p){
            return p.provider == 'twitter';
        });

        if (!twitter_id){
            context.add_message('You must be logged in with a twitter account to see your tweets', 'error');
            context.$go('/', done);
        } else {
            context.twitter_user = twitter_id;
            done();
        }
    },

    on_get_output: function(context, done){

        context.$out.set('twitter_user', context.twitter_user);
        done();
    }

};