var util = require('util');
var _ = require('underscore');
var URL = require('url');
var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var gate = require('gate');
var fs = require('fs');
var path = require('path');
var _model;
var _DEBUG = true;

var scan_job = require('./../../node_modules/elastic/scan_files.js');

var CHAT_FILES = path.resolve(__dirname, '../../chat_files');

module.exports = function (mongoose_inject) {

    if (_model) {
    } else {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var ObjectId = mongoose_inject.Schema.Types.ObjectId;

        var schema = new mongoose_inject.Schema({
            domain:'string',
            file:'string',
            lines:'number',
            parsed:'boolean',
            state:{type:'string', default:'not started'},
            response:'string',
            deleted:{type:'boolean', default:false}
        });

        _model = mm.create(
            schema,
            {
                set_chat_files:function (cf) {
                    CHAT_FILES = cf;
                },
                name:"noogle_file",
                get_file:function (domain, file, cb) {
                    this.find({domain:domain, file:file}, cb);
                },

                add_file:function (domain, file, cb) {
                    var self = this;
                    this.find(domain, file, function (err, old_file) {
                        if (old_file) {
                            cb(null, old_file);
                        } else {
                            self.put({domain:domain, file:file, parsed:''}, cb);
                        }
                    })
                },

                add_files:function (domain, files, cb) {
                    var g = gate.create();
                    var new_files = [];

                    files.forEach(function (file) {
                        new_files.push({domain:domain, file:file});
                    })

                    this.add(new_files, cb);
                },

                dom_info:function () {
                    return URL, parse(this.domain);
                },

                file_path:function (file) {
                    var out = path.resolve(CHAT_FILES, file.domain, file.file);
                    console.log('file path = %s', out);
                    return out;
                },

                read_stream:function (file, cb) {
                    var file_path = this.file_path(file);
                    fs.exists(file_path, function (exists) {
                        if (exists) {
                            var stream = fs.createReadStream(file_path);
                            cb(null, stream);
                        } else {
                            cb(new Error('file not found'));
                        }
                    })
                },

                line_regex:function (file) {
                    switch (file.domain) {
                        case 'static.izs.me':
                            return  /([:\d]{4,5}) <[ @]?([\w]+)> (.*)/;
                            break;

                        case 'nodejs.debuggable.com':
                            return /\[([^\]]+)\] ([\w]+): (.*)/;
                            break;

                        default:

                            throw new Error('cannot find regex for domain ' + this.domain);

                    }
                },

                add_dir:function (dir, cb) {
                    var self = this
                    console.log('erasing old domain file list for %s', dir);
                    this.model.update({domain:dir}, {"$set":{deleted:true}}, function (err) {
                        if (err) {
                            console.log('error deleting old dirs: %s', err.message);
                            return cb(err);
                        } else {
                            console.log('addig new files')
                            fs.readdir(path.resolve(CHAT_FILES, dir), function (err, files) {
                                console.log('files found: %s ...', files.slice(0, 4).join(','))
                                if (err) {
                                    cb(err);
                                } else {
                                    self.add_files(dir, files, cb);
                                }
                            })
                        }
                    })
                },

                start_scan:function (cb) {
                    scan_job.start_scan(cb);
                },

                add_dirs:function (cb) {
                    var self = this;
                    console.log('file model: adding dirs');
                    g = gate.create(cb);
                    if (!fs.existsSync(CHAT_FILES)) {
                        return cb(new Error("cannot find chat file dir " + CHAT_FILES));
                    }
                    fs.readdir(CHAT_FILES, function (err, dirs) {
                        console.log('add dirs: %s', dirs.join(','))
                        dirs.forEach(function (dir) {
                            self.add_dir(dir, g.latch(dir));
                        })
                        g.await(cb);
                    })

                }
            }, mongoose_inject
        )
    }
    return _model;
}
