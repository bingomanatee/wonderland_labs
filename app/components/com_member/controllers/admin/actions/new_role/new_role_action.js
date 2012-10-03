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
                if (rs.has_content('role.name', 'role.tasks')) {
                    self.on_input(rs);
                } else {
                    self.emit('validate_error', rs, 'missing name or tasks');
                }
            } else {
                self.emit('validate_error', rs, 'you are not authorized to see this page')
            }

        })
    },
    _on_validate_error_go:'/',

    on_input:function (rs) {
        this.on_process(rs, rs.req_props.role);
    },

    on_process:function (rs, input) {

        var self = this;
        var new_role = {
            name:input.name,
            tasks:input.tasks
        }

        this.models.member_role.put(new_role, function (err, new_role_record) {
            if (err) {
                self.emit('process_error', rs, err);
            } else if (new_role_record) {
                rs.flash('info', 'created new role ' +new_role_record.name);
                rs.send(new_role_record.toJSON());
            } else {
                self.emit('process_error', rs, 'Cannot create ' + util.inspect(new_role));
            }
        })
    },

    _on_error_go:true

}