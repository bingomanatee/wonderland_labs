var util = require('util');
var _ = require('underscore');
_.str = require('underscore.string');

function _ue(txt){
    return txt.replace(/&amp;lt;/g, '&lt;').replace(/&amp;gt;/g, '&gt;')
}

function _clean(article){

    var out = _.clone(article);

   delete  out.content;
   delete  out.summary;
    return out;
}

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;

        function _on_article(err, article) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (article) {
                self.models.member.can(rs, [ "create article"], function (err, can) {
                    self.model().links_to(article.scope, article.name, function(err, links_to){

                        self.on_process(rs, article, can, links_to)
                    })

                })
            } else {
                self.models.member.can(rs, ['edit any scope'], function (err, can) {
                    if (err) {
                        self.emit('validate_error', rs, err);
                    } else if (can) {
                        rs.flash('info', util.format('There is not currently an article %s in scope %s -- creating a new article', input.article, input.scope));
                        rs.go(util.format('/wiki/%s/%s/new', input.scope, input.article));
                    } else {
                        self.emit('input_error', rs,
                            util.format('cannot find article %s in scope %s, and you are not authorized ot edit articles',
                                input.article, input.scope));
                    }
                })

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

    _on_input_error_go:'/',

    on_process:function (rs, article, can_create, links_to) {
        var self = this;
        self.on_output(rs, {
            article_json: _clean(article.toJSON()),
            article: article,
            can_create:can_create,
            links_to: links_to,
            menus:[
                {
                    name:'wiki',
                    title:'Wiki',
                    items:[]
                }
            ]})
    }
}