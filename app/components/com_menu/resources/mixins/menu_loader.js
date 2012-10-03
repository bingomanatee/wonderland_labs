var NE = require('nuby-express');
var util = require('util');
var _DEBUG = false;
var Gate = NE.deps.support.nakamura_gate;
var menu_handler_factory = require('handlers/menu');

module.exports = {
    init:function (frame, cb) {
        var gate = Gate.create();

        if (_DEBUG) console.log('REASCANNING MENUS FOR FRAME %s', frame.path);

        frame.frame_controllers().forEach(function (con) {
            var menu_handler = menu_handler_factory(frame);
            con.reload([menu_handler], gate.latch(con.path), frame);
        })

        frame.get_components().forEach(function (con) {
            var menu_handler = menu_handler_factory(frame);
            con.reload([menu_handler], gate.latch(con.path), frame);
        })

        var menu_handler = menu_handler_factory(frame);
        frame.reload([menu_handler], gate.latch(frame.path), frame);

        console.log('gate count: %s', gate.count);

        gate.await(function(err, result){
            console.log('menu loader done: ');
            cb();
        });
    }
}