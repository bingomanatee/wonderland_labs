var NE = require('nuby-express');
var util  = require('util');

var _DEBUG = true;

module.exports = function (config, callback) {

    var frame = new NE.Framework();

    NE.log.set_log_file(__dirname + '/logs/nuby_express.log', {reset: true})
    frame.start_load(_on_load, __dirname + "/app");

    function _on_load() {
        if (_DEBUG) console.log('framework loaded');
        if (config){
            if(config.mongoose){
                frame.config.mongoose.db = config.mongoose.db;
            }
        }
        frame.start_server(function () {
            var port = frame.config.server.port;
            if (config) {
                if (config.port) {
                    port = config.port;
                }

                if(config.mongoose){
                    frame.config.mongoose.db = config.mongoose.db;
                }
            }

            console.log('listening to port %s', port);
            frame.server().listen(port);

            if (callback) {
                callback();
            }
        });
    }

    return frame;
};

