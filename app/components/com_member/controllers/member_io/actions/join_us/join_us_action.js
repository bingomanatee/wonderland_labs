var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var util = require('util');

/* *************** MODULE ********* */

module.exports = {

    /* ************* GET ************** */


    on_get_validate:function (rs) {
        this.on_output(rs);
    },

    /* ************* POST ************** */

    on_post_validate:function (rs) {
        if (rs.has('member')) {
            console.log('registering %s', util.inspect(rs.req_props.member));
            this.on_post_input(rs);
        } else {
            rs.flash('error', 'Member data missing');
            rs.go('/join_us');
        }
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props.member);
    },

    //@TODO: echo entries back so you can revise your bad member
    on_post_process:function (rs, member) {
        var self = this;

        if (member.member_name) {

            if (member.pass) {
                if (member.pass2) {
                    if (member.pass == member.pass2) {
                        var pass = member.pass;
                        delete member.pass;
                        delete member.pass2;
                        self.models.member.put(member, function (err, member_record) {
                            if (err) {
                                console.log('error for new member: %s', util.inspect(err));
                                rs.flash('error', err.message);
                                rs.go('/join_us');
                            } else if (member_record) {
                                self.models.member.set_member_pass(function (err, pw_member) {
                                    rs.flash('info', 'Thanks for registering');
                                    rs.go('/member/' + member_record._id);
                                }, member_record, pass, 'md5');
                            }
                        })
                    } else {
                        REG._add_alert('pass', 'Paswords must match', 'error');
                        REG._add_alert('pass2', 'Paswords must match', 'error');
                    }
                } else {
                    REG._add_alert('pass2', 'Duplicate password is required', 'alert');
                }
            } else {
                REG._add_alert('pass', 'Password is required', 'alert');

            }
        } else {
            REG._add_alert('member_name', 'Member name is required', 'alert');
        }
    }

}