var util = require('util');
var _DEBUG = false;

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */

    // note currently returns ALL scopes

    on_get_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['edit any scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_get_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to create scopes')
            }
        })
    },

    on_get_input:function (rs) {
        var self = this;
        this.model().scopes(function (err, scopes) {
            if (err) {
                self.emit('input_error', rs, err)
            } else {
                self.on_get_process(rs, scopes ? scopes : [])
            }
        })
    },

    on_get_process:function (rs, scopes) {
        rs.send(scopes)
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        //@TODO: granluarity for updating own scope
        var self = this;
        this.models.member.can(rs, ['create scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_post_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to create scopes')
            }
        })
    },

    on_post_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        if (_DEBUG) console.log('article rest put getting scope %s, article %s', input.scope);

        self.on_post_process(rs, input)
    },

    on_post_process:function (rs, article) {
        var self = this;
        var promote = article.promoted;
        delete article.promoted;

        function _promote(err, new_art) {
            if (err) {
                throw err;
            }
            var j = new_art.toJSON();
            if (_DEBUG) console.log('put article %s', util.inspect(j));

            if (promote) {
                promote.title = new_art.title;
                promote.notes = new_art.summary; //@TODO: wiki parse

                self.models.promote.promote(self.model().promote_basis(new_art), promote,
                    function (err, promotion) {
                        //@TODO: do something with feedback.
                        rs.send(j)
                    })
            } else {
                rs.send(j);
            }
        }

        if (_DEBUG) console.log('put: new data %s', util.inspect(article));
        var member = rs.session('member');
        article.creator = article.author = member._id;
        this.model().put(article, _promote);

    },
    /* ****** PUT ****** *

    on_put_validate:function (rs) {
        var self = this;
        self.on_put_input(rs)
    },

    on_put_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_put_process(rs, input)
    },

    on_put_process:function (rs, input) {
        var self = this;
        rs.send(input)
    },

    /* ****** DELETE ****** *

    on_delete_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create scope', 'edit any scope', 'delete any scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_delete_input(rs)
            } else {
                self.emit('validate_error', rs, 'you are not authorized to manage scopes')
            }
        })

    },

    on_delete_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_delete_process(rs, input)
    },

    on_delete_process:function (rs, input) {
        var self = this;
        rs.send(input)
    },
*/
    _on_error_go:true
}