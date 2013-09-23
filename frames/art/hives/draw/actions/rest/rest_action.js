var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/* -------------- EXPORT --------------- */

module.exports = {

    on_get_input: function(context, done){
      var model = this.model('drawings');

        if (context._id){
            model.get(context._id, function(err, drawing){
                if (err){
                    done(err);
                } else if (drawing) {
                    if (!drawing.public){
                        var member = context.$session('member');
                        if (!member){
                            done('Viewing private drwing');
                        } else {
                            var id = member._id.toString();
                            var creator = drawing.creator.toString();
                            if (id == creator){
                                context.drawing = drawing;
                                done();
                            } else {
                                context.$send({error: 'This drawing is private.'}, done);
                            }
                        }
                    } else {
                        context.drawing = drawing;
                        done();
                    }
                } else {
                    context.$send({error: 'cannot find drawing ' + context._id});
                }
            })
        } else {
            model.all(function(err, drawings){
                if (err) return done(err);
               context.drawings = drawings;
                done();
            });
        }
    },

    on_get_process: function(context, done){
      if (context._id){
            context.$send(context.drawing, done);
      } else {
          context.$send(context.drawings.map(function(drawing){
              return drawing.toJSON();
          }), done);
      }
    },

    /* ***************** POST *************** */

    on_post_validate: function (context, done) {
        done();
    },

    on_post_input: function (context, done) {
        context.drawing = _.pick(context, 'clut', 'tokens', 'shapes', 'name', 'description', 'public', 'creator');
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