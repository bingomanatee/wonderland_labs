var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var support = require('support');
var Gate = support.Gate;
var proper_path = support.proper_path;
var elements = require('./elements')

var _DEBUG = false;

function Controller(params, parent) {
    this.CLASS = 'Controller';
    this._actions = [];
    this._view_folders = [];
    this.config = {};

    _.extend(this, params);
    this.parent = parent;
    if (parent) {
        parent.add_controller(this);
    }

}

var _vc_template = _.template('<h1><%= view_title %></h1><%= view_content %>')

function _render_view_content(target) {
    if (target.view) {
        return target.view;
    } else {
        var t = _.extend({view_title:'', view_content:''}, target);
        return _vc_template(t);
    }
}
_.extend(Controller.prototype, elements);
_.extend(Controller.prototype, {
    render:function (cb) {

        if (this.rendered) {
            return cb();
        }
        this.rendered = true;
        var self = this;

        function _render_self() {
            if (_DEBUG) console.log('render self: %s(%s)', self.name, self.path);
            self.render_config(cb);
        }

        function _render() {
            self._render_children(_render_self);
        }

        if (this.parent) {
            this.parent.render(_render);
        } else {
            _render();
        }

    }
});

module.exports = Controller;