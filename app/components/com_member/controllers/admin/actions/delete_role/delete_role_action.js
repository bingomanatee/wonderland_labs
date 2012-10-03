var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['admin site'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to see this page')
            }
        })

    },

    _on_validate_error_go:'/',

    on_input:function (rs) {
        var self = this;
        this.models.member_role.get_role(rs.req_props.name, function (err, role) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (role) {
                self.on_process(rs, role);
            } else {
                self.emit('input_error', rs, 'cannot find role ' + rs.req_props.name);
            }
        })
    },

    on_process:function (rs, role) {
        var self = this;
        this.models.member_role.delete(role, function(err){

            if (err){
                self.emit('process_error', rs, err);
            } else {
                self.models.member.remove_role(role.name, function(){
                    rs.flash('info', 'Member role ' + role.name + ' has been deleted. You may have to restart the site to affect the state of logged-in members');
                    rs.go('/admin/member_roles');
                })
            }


        }, true);
    },

    _on_error_go:'/admin/member_roles'

}