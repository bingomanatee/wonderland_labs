var util = require('util');
var _DEBUG = false;

module.exports = {

    model:function () {
        return this.models.wizard_state;
    },

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        this.model().get_state(function (err, state) {
            self.on_get_process(rs, state);
        }, 'init_site', 'unix_user_action');
    },

    on_get_process:function (rs, unix_username) {
        var self = this;
        self.on_output(rs, {unix_username: unix_username});
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props.unix_username, rs.req_props.hasOwnProperty('next'), rs.req_props.hasOwnProperty('prev'));
    },

    on_post_process:function (rs, unix_username, next, prev) {

        var self = this;
        this.model().set_state(function (err, state) {
            if (_DEBUG) rs.flash('info', 'saved state ' + util.inspect(state));
            if (next) {
                rs.go('/init_site/facebook_app')
            } else {
                self.on_output(rs, {})
            }
        }, {unix_username: unix_username}, 'init_site', 'unix_username');

    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}