var util = require('util');
var _DEBUG = false;

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */
    /**
     * Note - GET retrieves ONE article; there is no real scenario
     * for retrieving all articles (even all articles of a scope)
     * with a generic rest endpoint.
     *
     */

    on_get_validate:function (rs) {

        var self = this;
        self.on_get_input(rs)
    },

    on_get_input:function (rs) {
        var self = this;

        function _on_article(err, article) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (article) {
                self.on_get_process(rs, article)
            } else {
                self.emit('input_error',
                    util.format('cannot find article %s in scope %s',
                        input.article, input.scope));
            }
        }

        var input = rs.req_props;
        if (input.scope) {
            if (input.article) {
                this.model().article(input.scope, input.article, _on_article);
            } else { // scope root
                this.model().scope(input.scope, _on_article);
            }
        } else {
            this.emit('input_error', rs, 'Cannot find article without scope');
        }
    },

    on_get_process:function (rs, article) {
        var self = this;
        rs.send(article);
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create article'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_post_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to create articles')
            }
        })
    },

    on_post_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_post_process(rs, input)
    },

    on_post_process:function (rs, article) {
        var self = this;
        self.model().sign(article, rs.session('member'));
        self.model().put(article, function (err, art_record) {
            if (err) {
                self.emit('process_error', rs, err);
            } else {
                self.model().link(art_record, function () {
                    rs.send(art_record);
                });
            }
        })
    },

    /* ****** PUT ****** */

    on_put_validate:function (rs) {
        //@TODO: granluarity for updating own scope
        var self = this;
        this.models.member.can(rs, ['edit any scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_put_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to update scopes')
            }
        })
    },

    on_put_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        if (_DEBUG) console.log('article rest put getting scope %s, article %s', input.scope, input.article);

        function _article(err, article) {
            if (_DEBUG) console.log('retrieved article %s', util.inspect(article));
            if (err) {
                self.emit('input_error', rs, err);
            } else if (article) {
                self.on_put_process(rs, article, input);
            } else {
                self.emit('cannot find article ' + input.article);
            }
        }

        if (input.article) {
            this.model().article(input.scope, input.article, _article);
        } else {
            this.model().scope(input.scope, _article);
        }
    },

    on_put_process:function (rs, article, input) {
        var self = this;
        var promote = input.promoted;
        delete article.promoted;

        function _promote(err, new_art) {
            if (err) {
                throw err;
            }
            var j = new_art.toJSON();
            if (_DEBUG) console.log('put article %s', util.inspect(j));

            delete j.versions;

            if (promote) {
                promote.title = new_art.title;
                promote.notes = new_art.summary; //@TODO: wiki parse
            }

            self.models.promote.promote(self.model().promote_basis(new_art), promote,
                function (err, promotion) {
                    console.log('linking article....');
                    self.model().link(article, function () {
                        console.log('sending data');
                        rs.send(j)
                    });

                })
        }

        if (
            (article.title == input.title) &&
                (article.summary == input.summary) &&
                (article.content == input.content)
            ) {
            // this article hasn't ben changed - possibly the metadata about promotion has.
            _promote(null, article);
        } else {
            if (_DEBUG) console.log('put: new data %s', util.inspect(input));
            this.model().revise(article, input, rs.session('member'));
            article.save(_promote);
        }
    },

    /* ****** DELETE ****** *

     on_delete_validate:function (rs) {
     var self = this;
     self.on_delete_input(rs)
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