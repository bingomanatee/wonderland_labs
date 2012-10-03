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
        this.models.wizard_state.get_state(function (err, state) {
            self.on_get_process(rs, state);
        }, 'init_site', 'facebook_app');
    },

    on_get_process:function (rs, state) {
        this.on_output(rs, state ? state : {facebook_app_id:'', facebook_app_domain:'', facebook_app_secret:''});
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props, rs.req_props.hasOwnProperty('next'), rs.req_props.hasOwnProperty('prev'));
    },

    on_post_process:function (rs, props, next, prev) {
        if (_DEBUG) console.log('next: %s, prev: %s', util.inspect(next), util.inspect(prev));
        var self = this;
        this.model().set_state(function (err, state) {
           if (_DEBUG) rs.flash('info', 'saved state ' + util.inspect(state));
            if (next) {
                rs.go('/init_site/facebook_app_test')
            } else if (prev) {
                rs.go('/init_site/unix_username')
            } else {
                self.on_output(rs, {})
            }
        }, props, 'init_site', 'facebook_app');

    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}