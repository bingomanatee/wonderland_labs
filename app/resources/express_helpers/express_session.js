var ne = require('nuby-express');

module.exports = {
    start_server:function (server, frame, cb) {
        var session_secret = frame.get_config('session_secret', 'Alfred E Neuman')
        var session_config = { secret: session_secret };

        if (frame.config.session) {
            session_config = frame.config.session;
        }

        server.use(
            ne.deps.express.cookieParser(session_config));
        server.use(
            ne.deps.express.session(session_config));
        cb();
    }

}