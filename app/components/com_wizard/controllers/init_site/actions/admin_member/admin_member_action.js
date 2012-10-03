var _DEBUG = false;
var util = require('util');
var _ = require('underscore');
var STUPID_PW_REGEX = /(fuck|shit|god|admin|abc|123|pass|[.]{4,})/i;
var MIN_PW_LENGTH = 8;
function _bad_password(props) {
    var p2 = props.pass2;
    var p1 = props.pass;
    if (_DEBUG) {
        console.log('p1: %s, p2: %s', p1, p2);
    }
    if (!p2) {
        return 'You must enter a password';
    } else if (!(p1 == p2)) {
        return 'Your passwords must match;'
    } else if (STUPID_PW_REGEX.test(p1)){
        return _DEBUG ? STUPID_PW_REGEX.match(p1) + ' is stupid': "We don't like that password. Try again."
     } else if (MIN_PW_LENGTH && p1.length < MIN_PW_LENGTH) {
        return 'Your password must be at least ' + MIN_PW_LENGTH + ' characters long. You are the site admin, after all. '
    } else {
        return false;
    }
}

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
        }, 'init_site', 'admin_member');
    },

    on_get_process:function (rs, state) {
        this.on_output(rs, state ? state :
        {member_name:'--', real_name:'--', password:'--', password2:'--'});
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        var member = rs.req_props.member;
        console.log('member: %s',util.inspect(member));
        this.on_post_process(rs, member, rs.has('next'), rs.has('prev'));
    },

    on_post_process:function (rs, props, next, prev) {
        if (_DEBUG) console.log('next: %s, prev: %s', util.inspect(next), util.inspect(prev));
        var self = this;


        this.model().set_state(function (err, state) {
            if (_DEBUG)    rs.flash('info', 'saved state ' + util.inspect(state));
            if (next) {
                var err = _bad_password(props);
                if (err) {
                    rs.flash('error', err);
                    return self.on_input(rs); // re-displaying page
                }

                rs.go('/init_site/confirm')
            } else if (prev) {
                rs.go('/init_site/facebook_app') // skipping back two steps
            } else {
                self.on_output(rs, {})
            }
        }, props, 'init_site', 'admin_member');

    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}