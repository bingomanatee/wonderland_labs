var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _can_view = new NE.helpers.View({
    name:'member_member',
    weight: 100,

    init:function (rs, input, cb) {
        return cb();
        if (_DEBUG) console.log('INIT CAN');

        if (!input.helpers){
            input.helpers = {};
        }

        input.helpers.member = function(){
            return rs.session('member');
        }

        if (input.javascript){
            if (!(_.indexOf(input.javascript, '/js/member_support/member.js')> -1)){
                    input.javascript.push('/js/member_support/member.js')
            }
        } else {
            input.javascript = ['/js/member_support/c_member.js'];
        }

      //  console.log('adding usser: %s', util.inspect(input.javascript));
        cb();
    }
});


module.exports = function () {
    return _can_view;
}