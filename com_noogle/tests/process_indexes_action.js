var tap = require('tap');
var index_action = require('./../controllers/noogle/actions/parse_indexes/parse_indexes_action.js');
var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var request = require('request');
var DOMAIN_NODEJS_DEBUGGABLE_COM = 'http://nodejs.debuggable.com';
var DOMAIN_STATIC_IZS_ME = 'http://static.izs.me/irclogs/node.js'
var path = require('path');
var COM_NOOGLE_ROOT = path.resolve(__dirname, '../../../');
var CHAT_FILE_DIR = path.resolve(COM_NOOGLE_ROOT, 'chat_files');
var wrench = require('wrench');
var events = require('events');
var NE = require('nuby-express');

/**
 * note - these "Tests" run on REAL search datbase!
 * only run BEFORE the app is up!
 */
tap.test('do an index', function (t) {
    _.extend(index_action, events.EventEmitter);

    var rs_mock = new NE.Req_State_Mock(index_action, {  });

    rs_mock.send = function (summary) {

        console.log('sent info: %s', util.inspect(summary, false, 4));
        t.end();
    }

    index_action.on_validate(rs_mock);


    index_action.on('parse_error', function (target, error) {
        console.log('parse error: %s', error.message);
        t.ok(!error, 'no error');
        t.end();
    })
});