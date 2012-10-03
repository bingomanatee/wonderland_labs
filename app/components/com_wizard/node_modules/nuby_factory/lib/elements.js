var _DEBUG = false;
var util = require('util');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var ejs = require('ejs');
var support = require('support');
var Gate = support.Gate;
var proper_path = support.proper_path;
var wrench = require('wrench');


function _mkdir(target) {
    var full_path = path.resolve(target.get_path());

    return full_path;
}

function make_dir() {
    var file_path = _mkdir(this);
    if (_DEBUG) console.log('making/validating dir >>>>>> %s', file_path);
    if (!fs.existsSync(file_path)) {
        var err = wrench.mkdirSyncRecursive(file_path)
        if (err) {
            throw err;
        }
    }
}

function get_path() {
    var file_path = [];
    if (this.file_path) {
        file_path.push(this.file_path);
    }
    if (this.parent) {
        if (_DEBUG) console.log('get_path: status: %s,  recusring for parent %s', file_path.join('/'), this.parent.name);
        file_path.unshift(this.parent.get_path(this));

        switch (this.CLASS) {
            case 'Controller':
                file_path.push('/controllers');
                break;

            case 'Component':
                file_path.push('/components');
                break;

            case 'Action':
                file_path.push('/actions');
                break;

            case 'View_File':
                break;

            case 'Views_Folder':
                break;

            default:
                throw new Error('pathing unknown class %s', util.inspect(this));
        }
    }
    file_path.push('/' + this.name);
    // console.log('returning path %s', util.inspect(file_path));
    return _.map(file_path, proper_path).join('');
}

function config_path() {
    return this.get_path() + '/' + this.name + '_config.json';
}

function render_config(cb) {
    var config = this.config ? this.config : {};
    var cp = this.config_path();
    fs.writeFile(cp, JSON.stringify(config), cb);
}

function _render_children(cb, debug) {
    if (!_.isFunction(cb)) {
        throw new Error('bad param to _render_children: %s', util.inspect(cb));
    }
    var self = this;

    function _render_target(target) {
        if (!target.rendered) {
            target.render(gate.task_done_callback(true));
        }
    }

    var subs = [];

    if (debug) {
        // console.log('looking for subs of %s', util.inspect(this, false, 0));
    }
    _.each('components,controllers,actions,view_folders,view_files'.split(','),
        function (dirname) {
            dirname = '_' + dirname;
            if (debug) {
                //       console.log(' ... looking for %s', dirname);
            }
            if (self.hasOwnProperty(dirname) && _.isArray(self[dirname])) {
                if (debug) {
                    //  console.log('_render_children: adding subs %s of %s', dirname, self.get_path());
                }
                subs = subs.concat(self[dirname]);
            }
        })

    subs = _.reject(subs, function (c) {
        return c.rendered;
    });

    if (debug) {
        //    console.log('unrendered subs of %s: %s', this.get_path(), subs.length);
    }

    var gate = new Gate(cb, 'rendering subs of ' + this.get_path());

    _.each(subs, function (c) {
        if (c.render && _.isFunction(c.render)) {
            c.render(gate.task_done_callback(true));
        } else {
            throw new Error('cannot render ' + util.inspect(c, true, 1));
        }
    })

    gate.start();
}

function _ef(aname, target, item) {
    if (target.hasOwnProperty(aname)) {
        target[aname].push(item);
    } else {
        target[aname] = [item];
    }
}

module.exports = {
    path:'',
    mkdir:_mkdir,
    make_dir:make_dir,
    get_path:get_path,
    config_path:config_path,
    render_config:render_config,
    _render_children:_render_children,
    add_component:function (com) {
        _ef('_components', this, com);
    },

    add_controller:function (con) {
        _ef('_controllers', this, con);
    },

    add_action:function (act) {
        _ef('_actions', this, act);
    },

    add_views_folder:function (vf) {
        _ef('_view_folders', this, vf);
    },

    add_view_file:function (vf) {
        _ef('_view_files', this, vf);
    }
}
