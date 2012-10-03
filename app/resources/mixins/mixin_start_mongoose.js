var NE = require('nuby-express');

module.exports = {
    init:function (frame, cb) {
        var con = 'mongodb://localhost/' + frame.get_config('mongoose.db');
        NE.deps.mongoose.connect(con);
        cb();
    }
}