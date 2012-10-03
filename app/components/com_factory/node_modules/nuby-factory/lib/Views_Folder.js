var _DEBUG = false;
var util = require('util');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var wrench = require('wrench');
var ejs = require('ejs');
var support = require('support');
var Gate = support.Gate;
var proper_path = support.proper_path;
var elements = require('./elements');

function Views_Folder(params, parent) {
    this.CLASS = 'Views_Folder';
    this.name = 'views';
    this.files = {};
    this.config = {};
    _.extend(this, params);
    if (parent) {
        this.parent = parent;
        parent.add_views_folder(this);
    }
}
_.extend(Views_Folder.prototype, elements);
_.extend(Views_Folder.prototype, {
    render:function (cb) {
        if (this.rendered) {
            return cb();
        }
        this.rendered = true;
        var self = this;

        function _render() {
            self.make_dir();
            self._render_children(cb, true);
        }

        if (this.parent) {
            if (this === this.parent) {
                throw new Error('rescurse much?')
            }
            this.parent.render(_render);
        } else {
            _render();
        }
    },

    render_files:function (cb) {
        var gate = new Gate(function () {
            cb();
        }, 'writing view files');
        var self = this;
        if (this.files && _.isObject(this.files)) {
            _.each(this.files, function (ct, name) {
                if (typeof ct == 'function') {
                    if (ct.hasOwnProperty('render')) {
                        ct = ct.render();
                    } else {
                        ct = ct();
                    }
                }
                var file_path = self.get_path() + '/' + name;
                fs.writeFile(file_path, ct, gate.task_done_callback(true));
            })
        }
        gate.start();
    }
})

module.exports = Views_Folder;
