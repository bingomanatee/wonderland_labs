var NE = require('nuby-express');
var util = require('util');
var _DEBUG = false;
var _DEBUG_OPTIONS = false;
var _ = require('underscore');
var Gate = NE.deps.support.Gate;

/* ***************** CLOSURE ******************* */

function _refresh_tasks(frame, src) {
    var opts = src.direct_config('tasks');
    if (opts && _.isArray(opts)) {
        opts = _.map(opts, function (saved_task) {
            var out = {src:src.name, class:src.CLASS};
            return _.extend(out, saved_task);
        });

        return opts;

    }
}

var tasks_model;

function _get_task(name, cb) {

    tasks_model.find_one({name:name, deleted:{"$ne":true}},
        function (err, opt) {
            if (err) {
                cb(err);
            } else if (opt) {
                cb(null, opt.value);
            } else {
                cb(new Error('cannot find task ' + name));
            }
        }
    )
}

/* ****************** MODULE ***************** */

module.exports = {
    init:function (frame, cb) {
        tasks_model = frame.get_resource('model', 'member_task');

        var tasks = {};

        var actions = frame.actions();

        console.log('%s actions ', actions.length);

        actions.forEach(function (action, i) {
            var action_tasks = action.get_config('tasks', [], true);

            tasks = _.reduce(action_tasks, function (memo, task) {
              //  console.log('memo: %s, task: %s', util.inspect(memo), util.inspect(task));
                memo[task] = true;
                return memo;
            }, tasks);
            delete action_tasks
           if (_DEBUG_OPTIONS){
               console.log('%s: tasks after %s = %s ....', i, action.path, util.inspect(tasks));
           }

        })

        tasks = _.keys(tasks);
        tasks = _.sortBy(tasks, _.identity);

        if (_DEBUG_OPTIONS){
        console.log('action tasks: %s', tasks.join(','));
        }

        tasks_model.active(function(err, mtasks){
            var task_names = _.map(mtasks, function(mtask){
                return mtask.name;
            });

            task_names = _.sortBy(task_names, _.identity);

            var tasks_not_in_config = _.difference(task_names, tasks);
            var unsaved_tasks = _.difference(tasks, task_names);
            if (unsaved_tasks.length < 1){
                return cb();
            }

            if (_DEBUG_OPTIONS){
            console.log('config tasks: %s', tasks.join(','));
            console.log('saved tasks: %s', task_names.join(','));
            console.log('tasks not in config: %s', tasks_not_in_config.join(','));
            console.log('unsaved_tasks: %s', unsaved_tasks.join(','));
            }
            var new_tasks = _.map(unsaved_tasks, function(t){
                return {name: t};
            })

            tasks_model.add(new_tasks, cb);
        })

    }
}

