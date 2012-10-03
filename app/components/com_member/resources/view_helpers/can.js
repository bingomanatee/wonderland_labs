var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _can_view = new NE.helpers.View({
    name:'member_can',

    init:function (rs, input, cb) {
        if (_DEBUG) console.log('INIT CAN');

        if (!input.helpers){
            input.helpers = {};
        }

        input.helpers.can = function(){
            var args = _.toArray(arguments);
            var tasks = _.flatten(args);
            return rs.action.can(rs, tasks);
        }

        cb();
    }
});


module.exports = function () {
    return _can_view;
}