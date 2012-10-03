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
var elastic = require('elastic');
var elastic_parsing = require('elastic/parsing');

var FILE_ROOT = path.resolve(__dirname, '../../../../chat_files');
/* *************** CLOSURE ******** */

var file_count = 0;
var done_count = 0;

function _parse_debuggable(file_dir, cb, _update_state) {
    var g = gate.create();
    fs.readdir(file_dir, function (err, files) {

        _update_state(files.length, 0);

        var open_files = 0;

        function _check_files() {
            if (open_files < 5) {

                //console.log('checking queue with %s open files', open_files);
                if (files.length) {

                    console.log("file_count: %s, done_count: %s, open_files", file_count, done_count, open_files)

                    var last_file = files.pop();

                    if (/\.txt$/.test(last_file)) {
                        var file_path = path.resolve(file_dir, last_file);
                        var regex = /\[([^\]]+)\] ([\w]+): (.*)/;

                        var ended = false;
                        var lines = 0;
                        var gcb = g.latch();
                        ++open_files;

                        elastic_parsing.parse_file(file_path, regex, function (err, result, count, fails) {

                            if (ended) {
                                return;
                            }

                            if (result == 'end') {

                                if (ended) {
                                    return;
                                }
                                _update_state(0, 1);
                                ended = true;
                                gcb(null, count, fails);
                                --open_files;
                                return;
                            }
                            if (err) {

                                if (ended) {
                                    return;
                                }
                                _update_state(0, 1);
                                ended = true;
                                gcb(err);

                                --open_files;
                                return;
                            }

                            _msg(result, _check_files, path.basename(file_path, '.txt'), lines);
                            ++lines;

                        })
                    } else {
                        setTimeout(function(){
                            process.nextTick(_check_files);
                        }, 100);
                    }
                } else {
                    console.log(" ...... done with %s", file_dir);
                    g.await(cb);
                }

            }
        }

        process.nextTick(_check_files);
    })
}

function _s(t) {
  //  console.log('second splitting %s', t);
    var a = _.map(t.split(":"), function(i){
        var n = parseInt(i);
        if (isNaN(n)){
      //      console.log('cannot parseint %s of %s', i, t);
            return 0;
        } else {
            return n;
        }
    });

    return 60 * a[0] + a[1];
}

function _msg(result, _check_files, date, l) {

    var m = {
        minute:_s(result[1]), username:result[2], message:result[3], date:date, line: l
    }
  //  console.log('sending message %s', util.inspect(m));
    elastic.message(m, function (err, mr) {
       // console.log('mr: %s', mr);
        process.nextTick(_check_files);
    })
}

function _parse_izs(file_dir, cb, _update_state) {
    var g = gate.create();
    fs.readdir(file_dir, function (err, files) {

        _update_state(files.length, 0);

        var open_files = 0;


        function _check_files() {
            if (open_files < 5) {

                if (files.length) {

                    console.log("file_count: %s, done_count: %s, open_files", file_count, done_count, open_files)

                    var last_file = files.pop();

                    /**
                     *
                     00:50 <@isaacs> do that
                     00:50 < TooTallNate> Hotroot: do that if you're only sending 1 string or buffer
                     */
                    if (/\.txt$/.test(last_file)) {
                        var file_path = path.resolve(file_dir, last_file);
                        var regex = /\[([:\d]+)\] <[ @]?([\w]+)> (.*)/;

                        var ended = false;
                        var lines = 0;
                        var gcb = g.latch();

                        elastic_parsing.parse_file(file_path, regex, function (err, result, count, fails) {
                            if (ended) {
                                return;
                            }
                            _update_state(0, 1);

                            if (result == 'end') {
                                ended = true;
                                gcb(null, count, fails);
                                return;
                            }
                            if (err) {
                                ended = true;
                                gcb(err);
                                return;
                            }

                            _msg(result, _check_files, path.basename(file_path, '.txt'), lines);
                            ++lines;


                        })
                    } else {
                        setTimeout(function(){
                            process.nextTick(_check_files);
                        }, 100);
                    }

                } else {
                    g.await(cb);
                    console.log(" ...... done with %s", file_dir);
                }
            }
        }

        g.await(cb);
        process.nextTick(_check_files);
    })
}

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;

        this.models.wizard_state.set_state(function(){
            self.on_process(rs);
        }, {files: 0, done: 0}, 'noogle', 'parse_indexes')
    },

    on_process:function (rs) {
        var self = this;
        var g = gate.create();

         file_count = 0;
         done_count = 0;

        function _update_state(f, d){
            if (f) file_count += f;
            if (d) done_count += d;


            self.models.wizard_state.set_state(function(){
            }, {files: file_count, done: done_count}, 'noogle', 'parse_indexes')
        }

        fs.readdir(FILE_ROOT, function (err, dirs) {

            dirs.forEach(function (dir) {
                switch (dir) {
                    case 'nodejs.debuggable.com':
                        _parse_debuggable(path.resolve(FILE_ROOT, dir), g.latch(dir), _update_state);

                        break;

                    case 'static.izs.me':
                        _parse_izs(path.resolve(FILE_ROOT, dir), g.latch(dir), _update_state);
                        break;
                }
            });

            g.await(function (err, results) {
                console.log('results: %s', util.inspect(results, false, 3));
                if (err) {
                    self.emit('process_error', rs, err);
                } else {
                    function _red(m, data) {
                        m.count += parseInt(data[1]);
                        m.fails += parseInt(data[2]);
                        return m;
                    }

                    if (results['nodejs.debuggable.com']){
                        var summary = _.reduce(results['nodejs.debuggable.com'][1], _red, {count:0, fails:0});
                    }
                    summary = _.reduce(results['static.izs.me'][1], _red, summary);
                    rs.send(summary);
                }
            })
        })

        // self.on_output(rs, output);
    }

}