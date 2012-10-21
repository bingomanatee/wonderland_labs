var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var rmdir = require('rmdir');

/* *************** CLOSURE *********************** */

var _DEBUG = false;

var EXPORT_ROOT = path.resolve(__dirname, '../../../../files');
if (_DEBUG)    console.log('exporting wiki dir: %s', EXPORT_ROOT)
if (!fs.existsSync(EXPORT_ROOT)) {
    mkdirp.sync(EXPORT_ROOT, 0775);
}

function _export_article(article, dir) {
    var filename =  path.resolve(dir, article.name + '.json');
    console.log('writing %s', filename);
    var data = article.toJSON();
    data.author = data.author.member_name;
    data.creator = data.creator.member_name;
    delete data.versions;
    delete data.link_to;

    fs.writeFile(filename, JSON.stringify(data), _.identity);
}

/* **************** MODULE ********************** */

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        var scope = input.scope;

        var scope_dir = path.resolve(EXPORT_ROOT, scope);

        this.model().articles_for_scope(input.scope, function (err, articles) {
            self.on_process(rs, scope_dir, articles)
        }, true, true)
    },

    on_process:function (rs, scope_dir, articles) {
        var self = this;

        function _process() {
            mkdirp(scope_dir, 0775, function () {
                _.each(articles, function (article) {
                    _export_article(article, scope_dir);
                })

                rs.flash('info', 'exported articles to ' + scope_dir);
                rs.go('/admin/wiki/scopes');
            })
        }

        if (fs.existsSync(scope_dir)) {
            rmdir(scope_dir, _process);
        } else {
            _process();
        }

    },

    /* ****** GET ****** */

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}