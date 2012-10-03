var _DEBUG = true;
var util = require('util');

module.exports = {

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        this.on_get_input(rs);
    },


    on_get_input:function (rs) {
        var self = this;
        this.models.wizard_state.get_state(function (err, state) {
            self.on_get_process(rs, state);
        }, 'init_site', 'facebook_app'); /// note - we are getting state from PREVIOUS step
    },

    on_get_process:function (rs, state) {
        var self = this;
        self.on_get_output(rs, state ? state : {facebook_app_id:'', facebook_app_domain:'', facebook_app_secret:''});
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        console.log('input: %s', util.inspect(rs.req_props));
        this.on_post_process(rs, rs.req_props, rs.req_props.hasOwnProperty('next'), rs.req_props.hasOwnProperty('prev'));
    },

    on_post_process:function (rs, props, next, prev) {
       if (_DEBUG) console.log('next: %s, prev: %s', util.inspect(next), util.inspect(prev));
        // note - no actual data retention at this step

        if (next) {
            rs.go('/init_site/admin_member')
        } else if (prev) {
            rs.go('/init_site/facebook_app')
        } else {
            self.on_output(rs, {})
        }

    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}