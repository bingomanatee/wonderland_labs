var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');

var model_def = {
    name:"slideshow",
    type:"model"
};

var _model;

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var oid = mongoose_inject.Schema.Types.ObjectId;

        var schema = new mongoose_inject.Schema({
            title: {type: 'string', unique: true, required: true},
            notes: 'string',
            content: 'string',
            author:{type: oid, ref:'member'},
            created: {type: 'date', default: Date.now},
            deleted:{type: 'boolean', default:false},
            parent: {type: oid, ref: 'slide'},
            weight: {type: 'number', default: 0}
        });

        _model = mm.create(schema, model_def, mongoose_inject);
    }
    return _model;
}
