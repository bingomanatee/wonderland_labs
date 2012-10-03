var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var request = require('request');
var elastic = require('elastic');
var _DEBUG = false;

/* *************** MODULE ********* */

module.exports = {

    init:function (frame, cb) {


        elastic.define_index(function (err, body) {
            console.log(body);
            console.log(err);


            elastic.status(function (err, body) {
                if (_DEBUG)           console.log(body);
                if (err) {
                    console.log('error: %s', err.message);
                    if (/ECONNREFUSED/.test(err.message)) {
                        console.log('initializing... ');
                        elastic.init(function(err, out){
                            if (_DEBUG)        console.log('initialization: %s', out);
                            cb();
                        });
                    } else {
                        if (_DEBUG)       console.log('err ignored: %s', err.message);
                        cb();
                    }
                } else {
                    cb();
                }

            })
        })
    }
}