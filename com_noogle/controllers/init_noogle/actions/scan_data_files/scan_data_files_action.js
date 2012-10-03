module.exports = {

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        self.on_get_input(rs)
    },

    on_get_input:function (rs) {
        var self = this;
        this.models.wizard_state.get_state(function (err, state) {
            self.on_get_process(rs, state);
        }, 'init_noogle', 'test_search');
    },

    on_get_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input)
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        self.on_post_input(rs)
    },

    on_post_input:function (rs) {
        var self = this;
        self.on_post_process(rs, rs.has_content("prev"), rs.has_content("next"));

    },

    on_post_process:function (rs, prev, next) {
        var self = this;

        this.models.wizard_state.set_state(function (err, state) {
            if (next) {
                rs.go("/init_noogle/test_search");
            } else if (prev) {
                rs.go("/init_noogle/index_data_files");
            } else {
                self.on_output(rs, {});
            }
        })
    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}