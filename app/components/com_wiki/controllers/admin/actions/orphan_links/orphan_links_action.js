var _ = require('underscore');

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
        var input = rs.req_props;
        this.model().orphan_links(function (err, articles) {
            self.model().article_map(function(err, map){
                self.on_process(rs, articles, map);
            });
        })
    },

    on_process:function (rs, articles, map) {
        function get_article(scope, name){
            return _.find(articles, function(a){
                return (a.name == name && a.scope == scope);
            })
        }

        var self = this;
        self.on_output(rs, {articles: articles, map: map, get_article: get_article})
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}