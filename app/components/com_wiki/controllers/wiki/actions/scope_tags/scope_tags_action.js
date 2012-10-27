var _ = require('underscore');

//@TODO: cache

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
        var scope = rs.req_props.scope;
        this.model().active().where('scope').equals(scope).select('tags').exec(function (err, arts) {
            var tags = _.reduce(arts, function (tags, art) {
                if (art.tags) {
                    tags = tags.concat(art.tags);
                }
                return tags;
            }, []);
            tags = _.uniq(_.map(tags, function (tag) {
                return tag.toLowerCase();
            }))
            self.on_process(rs, scope, tags);
        })
    },

    on_process:function (rs, scope, tags) {
        var self = this;
        self.on_output(rs, {tags:tags, scope: scope})
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}