var util = require('util');
var _ = require('underscore');

var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;

var _model;

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var ObjectId = mongoose_inject.Schema.Types.ObjectId;

        var schema = new mongoose_inject.Schema({
            name:String,
            title:String,
            notes:String,
            content_type:{type:String, enum:['text', 'html', 'json']},
            content:String,
            def_path:String,
            parent:ObjectId,
            state:mongoose_inject.Schema.Types.Mixed,
            deleted:{type:Boolean, default:false}
        });

        _model = mm.create(
            schema,
            {
                name:"wizard",
                get_name:function (name, cb) {
                    this.find_one({name:name}, cb);
                }
            }, mongoose_inject
        )
    }
    return _model;
}
