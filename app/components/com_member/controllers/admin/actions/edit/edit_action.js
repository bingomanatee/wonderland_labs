var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    /* *************** GET ********* */

    on_get_validate:function (rs) {

        var self = this;
        this.models.member.can(rs, ['admin site'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_get_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to view this page');
            }
        })
    },

    on_get_input:function (rs) {
        var self = this;

        this.models.member.get(rs.req_props._id, function (err, member) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (member) {
                self.models.member_role.options(member.roles, function (err2, roles) {
                    if (err2) {
                        self.emit('input_error', rs, err2);
                    } else {
                        self.on_get_process(rs, member, roles);
                    }
                })
            } else {
                self.emit('input_error', rs, 'cannot find member ' + rs.req_props._id);
            }
        })
    },

    on_get_process:function (rs, member, roles) {
        this.on_output(rs, {member:member, roles:roles});
    },

    _on_get_error_go:'/',

    /* *************** POST ********* */

    on_post_validate:function (rs) {
        //@TODO: put in security, field checkson_get_input
        var self = this;
        this.models.member.can(rs, ['admin site'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_post_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to view this page');
            }
        })
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props.member);
    },

    on_post_process:function (rs, member) {
        var self = this;

        if (!member.roles) {
            member.roles = [];
        } else if (_.isString(member.roles)) {
            member.roles = [member.roles];
        }
        this.models.member.revise(member, function (err, member_record) {
            if (err) {
                self.emit('input_error', rs, err);
            } else {
                rs.flash('info', 'member ' + member_record.member_name + ' updated');
                rs.go('/admin/members');
            }
        })
    },

    _on_post_error_go:'/admin/members'

}