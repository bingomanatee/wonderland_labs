var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var child_process = require('child_process')
/* *************** MODULE ********* */

var _unix_username = null;
module.exports = {
    "name":"own_by_me",

    own:function (cb, item_path, perm) {
        var self = this;
        if (_unix_username) {
            this._own(cb, item_path, perm);
        } else {
            this._load_unix_username(function () {
                self._own(cb, item_path, perm);
            })
        }
    },

    _load_unix_username:function (cb) {
        var site_options = this.framework.get_resource('model', 'site_options');
        site_options.option_value('unix_username', function(err, value){
            _unix_username = value;

            cb();
        })
    },

    _own:function (cb, item_path, perm) {
        fs.exists(item_path, function (exists) {
            if (exists) {
                var cp = child_process.spawn('chown', ['-R', _unix_username, item_path]);
                cb.on('exit', function (code) {
                    if (perm){
                        var cp2 = child_process.spawn('chmod', ['-R', perm, item_path]);
                        cp2.on('exit', cb);
                    } else {
                        cb();
                    }

                })
            } else {
                cb(new Error('path ' + item_path + ' does not exist'));
            }
        })
    }

}