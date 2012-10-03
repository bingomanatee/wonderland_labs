var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var request = require('request');
var DOMAIN_DEBUGGABLE = 'http://nodejs.debuggable.com';
var DOMAIN_STATIC_IZS_ME = 'http://static.izs.me/irclogs/node.js'
var gate = require('gate');
var path = require('path');
var http = require('http');
var url = require('url');
var write_chat = require('write_chat');
var _DEBUG = false;

var FILE_ROOT = path.resolve(__dirname, '../../../../chat_files');

/* ************* MODULE ************* */

module.exports = {

    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;

        if (rs.req_props.init) {

            self.models.noogle_file.model.update({deleted:false},
                {"$set":{deleted:true}},
                {multi:true},
                function () {
                    self.models.noogle_file.add_dirs(function () {
                        console.log('dirs added');
                        self.models.noogle_file.active().sort('domain, file').exec(function (err, files) {
                            console.log('processing files');
                            self.on_process(rs, files);
                        })
                    })
                }
            )

        } else {
            self.models.noogle_file.active().sort('domain, file').exec(function (err, files) {
                if (_DEBUG)     console.log('processing files');
                if (err) {
                    rs.emit('input_error', rs, err);
                } else {
                    self.on_process(rs, files);
                }
            })
        }

    },

    on_process:function (rs, files) {

        var stats = _.reduce(files, function (m, f) {
            ++m.files;
            if (f.parsed) {
                m.parsed++;
            }
            return m;
        }, {files:0, parsed:0});

        if (_DEBUG) console.log('output');
        this.on_output(rs, {stats:stats, files:files})
    }

}