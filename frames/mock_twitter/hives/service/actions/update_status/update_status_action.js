var _ = require('underscore');

module.exports = {

    on_validate: function(context, done){

        if (!(context.user || context.user_id)){
            done('must have user or user_id');
        } else if (!context.status){
            done('must have status');
        } else {
            done();
        }

    },

    on_input: function(context, done){

        context.message = _.pick(context, 'status', 'user_id', 'user');
        done();
    },

    on_process: function(context, done){

       this.model('mock_tweets').put_tweet(context.message, function(err, tweet){
          context.$send(tweet, done);
       });

    }

};