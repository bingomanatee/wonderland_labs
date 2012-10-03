var util = require('util');

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

        function _on_article(err, article) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (article) {
                rs.send(article);
            } else {
                self.emit('input_error',
                    util.format('cannot find article %s in scope %s',
                        input.article, input.scope));
            }
        }

        var input = rs.req_props;
        if (input.scope) {
            if (input.article) {
                this.model().article(input.scope, input.article, _on_article, true);
            } else { // scope root
                this.model().scope(input.scope, _on_article, true);
            }
        } else {
            this.emit('input_error', rs, 'Cannot find article without scope');
        }

    },

    _on_error_go: true

}