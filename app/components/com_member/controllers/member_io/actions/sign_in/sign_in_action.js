var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    /* ************* GET ************** */


    on_get_validate:function (rs) {

        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;

        self.on_output(rs);
    },

    /* ************* POST ************** */

    on_post_validate:function (rs) {
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props.member_name, rs.req_props.pass);
    },

    on_post_process:function (rs, name, pass) {
        var self = this;
        console.log('logging in as %s, %s', name, pass);
        this.models.member.sign_in(function (err, member) {
            if (err) {
                console.log('... failed login: %s', util.inspect(err));
                self.emit('process_error', rs, err);
            } else if (member) {
                console.log('... successful login: %s', util.inspect(member));
                rs.set_session('member', member);
                rs.flash('info', 'signed in as ' + name);
                rs.go('/');
            } else {
                self.emit('process_error', rs, 'cannot sign in as ' + name)
            }
        }, name, pass);
    },

    _on_error_go:'/'

}