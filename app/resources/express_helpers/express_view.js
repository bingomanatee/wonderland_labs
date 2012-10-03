var ne = require('nuby-express');

module.exports = {
    start_server: function(server, frame, cb){
        server.register('html', ne.deps.ejs);
        var view_dir = frame.path + '/views';
        server.set('views', view_dir);
        cb();
    }
}