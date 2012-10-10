var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rmdir = require('rmdir');

/* *************** CLOSURE *********************** */

var _DEBUG = false;

var _EXPORT_ROOT = path.resolve(__dirname, '../../../../files');
if (_DEBUG)    console.log('exporting wiki dir: %s', _EXPORT_ROOT)
if (!fs.existsSync(_EXPORT_ROOT)) {
    mkdirp.sync(_EXPORT_ROOT, 0775);
}

var key_fields = [
    "scope",
    "name",
    "title",
    "summary",
    "content",
    "scope_root"
]

/* **************** MODULE ********************** */

module.exports = {

    EXPORT_ROOT:_EXPORT_ROOT,

    model:function () {
        return this.models.wiki_article;
    },

    on_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create article'], function (err, can) {
            if (can) {
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'cannot create articles');
            }
        });
    },

    on_input:function (rs) {
        var self = this;

        if (!rs.has_content('scope')) {
            console.log('no scope: index');
            return this.on_index(rs);
        } else {
            var input = rs.req_props;
            var scope = input.scope;
            console.log('--------------- scope: %s, rp: %s ', scope, util.inspect(input));
        }

        var scope_dir = path.resolve(self.EXPORT_ROOT, scope);

        fs.exists(scope_dir, function (exists) {
            if (exists) {
                fs.readdir(scope_dir, function (err, files) {
                    self.on_process(rs, scope_dir, files, scope);
                })
            } else {
                rs.flash('error', 'cannot find exported files in ' + scope_dir);
                rs.go('/admin/wiki/scopes');
            }
        })
    },

    import_file:function (rs, data_file_path) {
        var self = this;
        fs.readFile(data_file_path, 'utf8', function (err, content) {
            if (err) {
                self.emit('process_error', rs, err);
            } else {
                try {
                    var j = JSON.parse(content);
                    console.log('source: %s', util.inspect(j));

                    var new_file = {};
                    key_fields.forEach(function (field) {
                        new_file[field] = j[field];
                    });

                    self.model().sign(new_file, rs.session('member'));

                    self.model().article(new_file.scope, new_file.name, function (err, art) {
                        if (art){
                            self.model.revise(art, new_file, rs.session('member'));
                            art.save();
                        } else {
                            self.model().put(new_file, function (err, nm) {
                                if (err) {
                                    self.emit('process_error', err);
                                }
                            })

                        }
                    }, true);

                } catch (err) {
                    console.log('cannot parse %s: %s', data_file_path, err.message);
                }
            }
        })
    },

    on_process:function (rs, scope_dir, files, scope) {
        var self = this;

        //@TODO: wipe old articles ??

        files.forEach(function (file) {
            var data_file_path = path.resolve(scope_dir, file);
            console.log('importing %s', data_file_path);
            self.import_file(rs, data_file_path);
        })

        rs.flash('info', 'imported ' + scope_dir);
        this.on_index(rs);
    },

    /* ****** INDEX ****** */

    on_index:function (rs) {
        console.log('making index for imput');
        var self = this;
        fs.readdir(self.EXPORT_ROOT, function (err, files) {
            self.on_output(rs, {files:files})
        });
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}