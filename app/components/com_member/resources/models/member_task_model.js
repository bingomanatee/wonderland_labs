var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');

var MAX_AGE_OF_TASK_NAME_CACHE = 60000; // refresh task names every minute

var _task_names_cache = false;
var _task_names_cache_created = 0;

var model_def = {
    name:"member_task",
    type:"model",
    task_names:function (cb) {
        var t = new Date().getTime();
        if ((!_task_names_cache) || ((t - MAX_AGE_OF_TASK_NAME_CACHE) < _task_names_cache_created)) {

            this.active(function (err, tasks) {
                if (err) {
                    return cb(err);
                } else {
                    _task_names_cache = _.pluck(tasks, 'name');
                    _task_names_cache_created = t;
                    cb(null, _task_names_cache.slice(0));
                }
            })
        } else {
            cb(null, _task_names_cache);
        }

    },

    /**
     * expresses task list as a useful data stream for a list of checkboxes.
     * tasks whose names are included in the first parameter will be checked.
     * @param checked: [String]
     * @param cb: function
     */
    options:function (checked, cb) {
        this.active(function (err, tasks) {
            if (err) {
                return cb(err);
            } else {
                var options = _.map(tasks, function (task) {
                    return {
                        name:task.name,
                        checked:_.include(checked, task.name)
                    };
                });
                cb(null, options);
            }
        })
    }
};

var _model;

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var schema = new mongoose_inject.Schema({
            name:String,
            deleted:{type:Boolean, default:false}
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
