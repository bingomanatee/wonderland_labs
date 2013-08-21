module.exports = {

    on_validate: function(context, done){
        if (!(context.user || context.user_id)){
            done('Must include user_id or user_name');
        }
        done();
    },

    on_input: function (context, done) {
        var model = this.model('mock_tweets');
        model.get_tweets(context, function(err, tweets){
            context.$send(err || tweets, done);
        })
    }

}