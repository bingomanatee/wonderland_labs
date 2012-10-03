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

var FILE_ROOT = path.resolve(__dirname, '../../../../chat_files');

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props.scope);
    },

    on_process:function (rs, scope) {
        var self = this;
        var scope_limit = (scope == 'all') ? 50000 : parseInt(scope); // setting a sane limit in case of infinity;

        var out = [];

        write_chat.files_at_domain(DOMAIN_STATIC_IZS_ME, function (err, files) {
            if (err) {
                self.emit('process_error', err);
            } else {
                console.log('files: %s', util.inspect(files, true, 1));
                //  return rs.send([]);
                files.import_all(function (err, status) {
                  //  console.log('done with import all');
                    if (err) {
                        self.emit('process_error', err);
                    } else if (scope == 'all') {

                        write_chat.files_at_domain(DOMAIN_DEBUGGABLE, function (err2, files2) {
                            if (err2) {
                                self.emit('process_error', err2);
                            } else {

                                files2.import_all(function (err3, status) {
                                    if (err3) {
                                        self.emit(rs, 'process_error', err3);
                                    } else {
                                        var ftj = files.toJSON();
                                        var ftj2 = files2.toJSON();
                                        rs.send(ftj.files.concat(ftj2.files));
                                    }
                                });
                            }
                        }, scope_limit)

                    } else if (scope >= files.length()) {
                        var ftj = files.toJSON();

                       // console.log('ftj: %s', util.inspect(ftj));
                        rs.send(ftj.files);
                    } else {
                        var next_scope = scope - files.length();

                        write_chat.files_at_domain(DOMAIN_DEBUGGABLE, function (err2, files2) {
                            if (err2) {
                                self.emit(ea, 'process_error', err2);
                            } else {

                                files2.import_all(function (err3, status) {
                                    if (err3) {
                                        self.emit('process_error', err3);
                                    } else {
                                        var ftj = files.toJSON();
                                        var ftj2 = files2.toJSON();
                                        rs.send(ftj.files.concat(ftj2.files));
                                    }
                                });
                            }
                        }, next_scope)
                    }
                });
            }
        }, scope_limit);

        // self.on_output(rs, output);
    }

}