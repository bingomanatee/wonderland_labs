var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var util = require('util');
var _ = require('underscore');

var member_task_model_factory = require('./member_task_model');
var _model;

function _task_options(role, cb) {
    var tasks = [];
    if (role.tasks) {
        tasks = role.tasks;
    }

    var member_tasks = member_task_model_factory();

    member_tasks.options(tasks, cb);
}

var model_def = {
    name:"member_role",
    type:"model",

    /**
     * note - this will find the tasks as a union of all the given roles.
     * @param roles: [String] | String -- the name(s) of one or more roles.
     * @param cb: function
     * @return {*}
     */

    roles_tasks:function (roles, cb) {
        if (!roles || (roles.length == 0)) {
            return cb(null, []);
        } else if (!_.isArray(roles)) {
            roles = [roles];
        }

        this.find({name:{"$in":roles}}, function (err, roles) {
            //@TODO: might be more efficient to cache by combination of role names on a production site.
            if (err) {
                cb(err);
            } else {
                var tasks = _.reduce(roles, function (m, r) {
                    return m.concat(r.tasks);
                }, []);
                cb(null, _.sortBy(_.uniq(tasks), _.identity));
            }

        })
    },

    /**
     * Fetches a named role. Optionally, creates it if it does not exist.
     * @param name: String
     * @param cb: function
     * @param create: Boolean
     */
    get_role:function (name, cb, create) {
        var self = this;
        if (!name) {
            cb(new Error('no name passed to get_role'));
        } else {
            this.find_one({name:name}, function (err, role) {
                if (role) {
                    cb(null, role);
                } else if (create) {
                    self.put({name:name}, cb);
                } else {
                    cb(null, false);
                }
            });
        }
    },

    /**
     * expresses role list as a useful data stream for a list of checkboxes.
     * roles whose names are included in the first parameter will be checked.
     * @param checked: [String]
     * @param cb: function
     */
    options:function (checked, cb) {
        this.active(function (err, roles) {
            if (err) {
                return cb(err);
            } else {
                var options = _.map(roles, function (role) {
                    return {
                        name:role.name,
                        checked:_.include(checked, role.name)
                    };
                });
                cb(null, options);
            }
        })
    },

    role_task_options:function (role, cb) {
        var self = this;
        if (_.isString(role)) {
            this.get_role(role, function (err, role_record) {
                if (err) {
                    cb(err);
                } else if (role_record) {
                    _task_options(role_record, cb);
                } else {
                    cb(new Error('cannot get role ' + role));
                }
            });
        } else {
            _task_options(role, cb);
        }
    },

    /**
     * This method will either create an existing role
     * with the given name
     * or reset an existing roles' task list to only the given tasks.
     *
     * define_role(cb, 'admin', '*') -- callback recieves a role with ALL tasks
     * define_role(cb, 'member_admin', ['admin members'] -- callback recieves a role with tasks ['admin members']
     *
     * NOTE: you cannot use tasks that aren't in the current roster of tasks - trying to do so will throw an error.
     *
     * @param cb
     * @param name
     */
    define_role:function (cb, name, tasks) {
        var self = this;
        if (!name) {
            name = 'admin'
        }
        ;
        var member_task_model_factory = require('./member_task_model');
        var member_tasks = member_task_model_factory();

        member_tasks.task_names(function (err, task_names) {
            console.log('setting role %s ...  to [%s]', name, util.inspect(tasks));
            if ((!tasks) || (tasks == '*')) {
                console.log(' ... all tasks: %s', util.inspect(task_names));
                tasks = task_names;
            } else if (tasks == 'none') {

                tasks = [];
            } else {
                var invalid_tasks = _.difference(tasks, task_names);
                if (invalid_tasks.length) {
                    return cb(new Error('the following tasks do not exist in our task list: %s', invalid_tasks.join(', ')))
                }
            }
            self.get_role(name, function (err, role) {
                role.tasks = tasks;
                role.markModified('tasks');
                role.save(cb);
            }, true);

        })


    }

};

module.exports = function (mongoose_inject) {
    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var schema = new mongoose_inject.Schema({
            name:{type:String, index:{unique:true}},
            tasks:[String],
            deleted:{type:Boolean, deleted:true}
        });

        _model = mm.create(schema, model_def, mongoose_inject);

    }
    return _model;
}
