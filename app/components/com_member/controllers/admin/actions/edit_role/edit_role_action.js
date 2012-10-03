var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    model:function () {
        return this.models.member_role;
    },

    /* ************* GET ************** */


    on_get_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['admin site'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_get_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to see this page')
            }
        })
    },

    on_get_input:function (rs) {
        var self = this;
        this.model().get_role(rs.req_props.name, function (err, role) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (role) {
                self.model().role_task_options(role, function (err2, tasks) {
                    if (err2) {
                        self.emit('input_error', rs, err2);
                    } else {
                        self.on_get_process(rs, role, tasks);
                    }
                })
            } else {
                self.emit('input_error', rs, 'cannot get role ' + this.req_props.name);
            }

        })
    },

    on_get_process:function (rs, role, tasks) {
        var self = this;

        self.on_output(rs, {role: role, tasks: tasks});
    },

    /* ************* POST ************** */

    on_post_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['admin site'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                if (rs.has_content('role')){
                    self.on_post_input(rs);
                } else {
                    self.emit('post_error', rs, 'no role passed');
                }
            } else {
                self.emit('validate_error', rs, 'you are not authorized to see this page')
            }
        })
    },

    on_post_input:function (rs) {
        var self = this;
        self.on_post_process(rs, rs.req_props.role);
    },

    on_post_process:function (rs, role) {
        var self = this;
        console.log('role data: %s', util.inspect(role));
        this.model().revise(role, function(err, role_record){
            if (err){
                rs.flash('error', err.message);
            } else {
                rs.flash('info', 'role ' + role.name + ' updated');
            }
            rs.go('/admin/member_roles');
        })
    }

}