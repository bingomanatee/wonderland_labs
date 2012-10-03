var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var ejs = require('ejs');

var _edit_button = ejs.compile('<a href="/admin/member/<%= _id %>" ><i class="icon-edit"></i> Edit Member</a>');

var _roles = function (member) {
    return member.roles ? member.roles.join(', ') : '--'
}
/* *************** MODULE ********* */

module.exports = {

    /* ****************** GET **************** */

    on_get_validate:function (rs) {
        var self = this;
        return self.on_get_input(rs);

        this.models.member.can(rs, [ "admin members"], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_get_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to see this page')
            }
        })
    },
    _on_validate_error_go:'/',

    on_get_input:function (rs) {
        var self = this;
        this.models.member_role.active(function (err, roles) {
            if (err) {
                self.emit('input_error', rs, err);
            } else {
                self.models.member_task.active(function (err2, tasks) {

                    if (err2) {
                        self.emit('input_error', rs, err2);
                    } else {
                        self.on_get_process(rs, roles, tasks);
                    }
                })
            }
        })
    },

    on_get_process:function (rs, roles, tasks) {

        this.on_output(rs, {
            list:false,
            roles:_.pluck(roles, 'name'),
            tasks:_.pluck(tasks, 'name')
        });
    },

    /* ************** POST **************** */

    on_post_validate:function (rs) {
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
        var self = this;


        var p = rs.req_props;

        if (p.find_by_name) {
            // q.regex('member_name', '.*' + rs.req_props.name + '.*');
            var q = this.models.member.find({"$or":[
                {member_name:new RegExp(rs.req_props.name, 'i')},
                {real_name:new RegExp(rs.req_props.name, 'i')}
            ]}).sort('member_name');
        } else {

            var q = this.models.member.active().sort('member_name');
        }

        if (p.find_by_role) {
            q.where('roles').in(rs.req_props.roles);
        }

        if (p.find_by_task) {
            q.where('tasks').in(rs.req_props.tasks);
        }
//@TODO: expose in UI
        if (p.find_by_email) {
            q.regex('email', rs.req_props.email);
        }

        q.slice(0, 50);
        q.exec(function (err, members) {
            if (err) {
                self.emit('input_error', rs, 'err');
            } else {
                var data_table_config = {
                    title:'Members',
                    data:members,
                    columns:[
                        {label:'Member_name', field:'member_name', width:'23%'},
                        {label:'Real Name', field:'real_name', width:'23%'},
                        {label:'roles', template:_roles, width:'23%'},
                        {label:'&nbsp;', template:_edit_button, width:'20%'}
                    ]}

                self.on_output(rs, {list:true, data_table_config:data_table_config, "layout_name":"empty"});
            }
        })
    },

    _on_post_error_go:'/'

}