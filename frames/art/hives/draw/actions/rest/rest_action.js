var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/* -------------- EXPORT --------------- */

module.exports = {

    on_post_validate: function (context, done) {
        done();
    },

    on_post_input: function (context, done) {
        context.drawing = _.pick(context, 'clut', 'tokens', 'shapes');
        done();
    },

    on_post_process: function (context, done) {
        var model = this.model('drawings');
        model.put(context.drawing, function (err, drawing) {
            if (err) {
                done(err);
            } else {
                context.drawing_saved = drawing;
                done();
            }
        });
    },

    on_post_output: function (context, done) {
        context.$send(context.drawing_saved.toJSON(), done);
    }
}