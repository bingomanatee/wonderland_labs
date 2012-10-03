var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _can_view = new NE.helpers.View({
    name:'member_member',
    weight: 100,

    init:function (rs, input, cb) {
        return cb();

        if (_DEBUG) console.log('INIT member_js');

        if (input.javascript){
            if (!(_.indexOf(input.javascript, '/js/member_support/c_member.js')> -1)){
                    input.javascript.push('/js/member_support/c_member.js')
            }
        } else {
            input.javascript = ['/js/member_support/c_member.js'];
        }

        if (_DEBUG) console.log('adding member js: %s', util.inspect(input.javascript));
        cb();
    }
});


module.exports = function () {
    return _can_view;
}