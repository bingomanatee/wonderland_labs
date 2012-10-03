var _DEBUG = false;

module.exports = {

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        this.on_output(rs, {});
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
        // note - no input here.
        if (next) {
            rs.go('/')
        } else if (prev) {
            rs.go('/init_site/') // note - starting from beginning
        } else {
            self.on_output(rs, {})
        }

    },
    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}