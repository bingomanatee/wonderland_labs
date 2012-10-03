var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');

var _DEBUG = true;

var _model_def = {
    name:"wizard_step",

    find_wizard_steps:function (wizard, cb) {
        if (_DEBUG) console.log('finding steps for wizard %s', util.inspect(wizard));

        if (wizard._id) {
            wizard = wizard._id;
        }

        _model.find({wizard:wizard, '$nor':[
            {deleted:true}
        ]}).sort('order').exec(cb);
    }
};

var _model;

module.exports = function (mongoose_inject) {
    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var ObjectId = mongoose_inject.Schema.Types.ObjectId;

        var step_schema = mongoose_inject.Schema({
            wizard:ObjectId,
            title:String,
            bc_title:String,
            name:String,
            notes:String,
            content_type:{type:String, enum:['text', 'html', 'json']},
            content:String,
            order:Number,
            deleted:false
        });

        _model = mm.create(step_schema, _model_def, mongoose_inject);

    }
    return _model;
}
