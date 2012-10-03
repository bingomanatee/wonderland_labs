var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;

var util = require('util');
var _ = require('underscore');

var _model;

var model_def = {
    name:"i18n",
    type:"model"

};

module.exports = function (mongoose_inject) {
    if (!_model) {


        if (!mongoose_inject){
            mongoose_inject = NE.deps.mongoose;
        }

        var trans =  mongoose_inject.Schema[{
            lang: 'string',
            term: 'string'
        }]

        var schema =  mongoose_inject.Schema({
            term:{type:String, index:{unique:true}},
            trans: [trans],
            deleted:{type:Boolean, deleted:true}
        });

        schema.statics.active = function (cb) {
            return this.find('deleted', {'$ne':true}).run(cb);
        }

        schema.statics.inactive = function (cb) {
            return this.find('deleted', true).run(cb);
        }

        _model = mm.create(schema, model_def, mongoose_inject);
    }
    return _model;
}
