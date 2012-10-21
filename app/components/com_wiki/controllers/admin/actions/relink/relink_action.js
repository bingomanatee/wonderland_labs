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
        self.on_process(rs, input)
    },

    on_process:function (rs, input) {
        var self = this;

        this.model().active().stream().on('data',function (doc) {
            self.model().link(doc, _.identity, true);
        }).on('error',function (err) {
                rs.send(err);
            }).on('close', function () {
                rs.send({relinked:true})
            });

    },

    /* ****** GET ****** */

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:true // the URL to redirect to on emitted errors. set to true to return errors in JSON
}