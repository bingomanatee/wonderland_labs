module.exports = {
    init:function (rs, input, cb) {
        ['nav', 'sidebar', 'hero'].forEach(function (t) {

            if (!input.hasOwnProperty(t)) {
                input[t] = false;
            }
        })
        cb();
    }
}