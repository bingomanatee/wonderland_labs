var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');

var _model;

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var model_def = {
            name:"slideshow",
            type:"model",

          slides: function(slideshow, cb){
                if (slideshow._id){
                    slideshow = slideshow._id;
                }

                var slide_model_factory = require('./slide_model');

                var slide_model = slide_model_factory.create(mongoose_inject);

                slide_model.active().where('slideshow').equals(slideshow).orderBy('weight').exec(function(err, slides){
                    var root_slides = _.filter(slides, function(s){ return !s.parent;});

                    root_slides.forEach(function(slide, i){
                        var child_slides = _.filter(slides, function(child){
                            return child.parent.toString() == slide._id.toString();
                        })
                        if (child_slides && child_slides.length){
                            root_slides[i] = [slide].concat(child_slides);
                        }
                    })

                    cb(null, _.flatten(root_slides));

                });
            }

        };

        var oid = mongoose_inject.Schema.Types.ObjectId;

        var schema = new mongoose_inject.Schema({
            title: {type: 'string', unique: true},
            notes: 'string',
            author:{type:oid, ref:'member' },
            markdown: 'boolean',
            created: {type: 'date', default: Date.now},
            deleted:{type: 'boolean', default:false}
        });

        _model = mm.create(schema, model_def, mongoose_inject);
    }
    return _model;
}
