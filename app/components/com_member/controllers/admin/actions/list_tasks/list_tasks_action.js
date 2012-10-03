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

    on_input:function (rs) {
        var self = this;
        this.models.member_task.active(function (err, tasks) {
            if (err) {
                self.emit('input_error', rs, err);
            } else {
                self.on_process(rs, tasks);
            }
        });
    },

    on_process:function (rs, tasks) {
        var self = this;

        var data_table_config = {
            title:'Member Tasks',
            data:tasks,
            columns:[
                {label:'Name', field:'name', width:'12em'}
            ]}

        self.on_output(rs, {data_table_config:data_table_config});
    }

}