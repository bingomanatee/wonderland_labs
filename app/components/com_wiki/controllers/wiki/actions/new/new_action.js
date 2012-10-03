module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */


    on_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create article'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to create articles')
            }
        })
    },

    _on_validate_error_go: '/',

    on_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_process(rs, {article: input})
    },

    on_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input)
    }
}