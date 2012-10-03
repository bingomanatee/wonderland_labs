var _ = require('underscore');
var util = require('util');
var _DEBUG;

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['edit any scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_get_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to edit articles')
            }
        })
    },

    _on_error_go: '/',

    on_get_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        if (_DEBUG) console.log('getting scope %s, article %s', input.scope, input.article);

        function _article(err, article) {
            if (_DEBUG) console.log('retrieved article %s', util.inspect(article));
            if (err) {
                self.emit('input_error', rs, err);
            } else if (article) {
                self.models.promote.get_basis(
                    self.model().promote_basis(article),
                    function (err, promoted) {
                        article = article.toJSON();
                        delete article.summary;
                        delete article.content;
                        delete article.author;
                        delete article.creator;
                        self.on_get_process(rs, {article:article, promoted:promoted})
                    }
                )
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

    on_get_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input)
    }

    /* ****** POST ****** *

     on_post_validate:function (rs) {
     var self = this;
     self.on_post_input(rs)
     },

     on_post_input:function (rs) {
     var self = this;
     var input = rs.req_props;
     self.on_post_process(rs, input)
     },

     on_post_process:function (rs, input) {
     var self = this;
     rs.send(input)
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

     a:'a' // last comma */
}