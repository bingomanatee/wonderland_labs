var util = require('util');
var _DEBUG = true;
var Twit = require('twit');
var _ = require('underscore');
var fs = require('fs');

function _digest_twitter_options(values){
    var config = {};

    var tw = /^twitter_(.*)/;

    _.each(values, function (value, key) {
      //  console.log('key: %s, value: %s, ', key, value);
        if (tw.test(key)) {
            var k = tw.exec(key)[1];
            config[k] = value;
        }
    });

    return config;
}

module.exports = {
    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;

        this.models.site_options.option_value([
            'twitter_consumer_key'
            , 'twitter_consumer_secret'
            , 'twitter_access_token',
            , 'twitter_access_token_secret'

        ], function (err, values) {
         //   console.log('values: %s', util.inspect(values));
            var config = _digest_twitter_options(values);
            var twit_conn = new Twit(config);
            var send = setTimeout(function(){
                self.on_process(rs, [{text: 'offline'}], null, config);
                send = false;
                console.log('offline home page')
            }, 1000);
            twit_conn.get('statuses/user_timeline', {screen_name: 'david_edelhart', count: 100}, function (err, tweets) {
                if (send){
                    clearTimeout(send);
                    if (err){
                        if (err.code= 'ENOTFOUND'){
                            self.on_process(rs, [{text: 'offline'}], err, config);
                        } else {

                            self.on_process(rs, [{text: err.message}], err, config);
                        }
                    } else {
                        self.on_process(rs, tweets, util.inspect(err), config);
                        console.log('online home page: %s, %s', util.inspect(tweets).slice(0, 100), util.inspect(err))
                    }
                }
            });

        })

    },

    on_process:function (rs, tweets, te, tv) {
        this.on_output(rs, {tweets: tweets, te: te, tv: tv});
    }


}