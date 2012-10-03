var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/**
 * Shows the public information on a member.
 * You might want to put this behind some sort of permission gate.
 *
 * @type {Object}
 */
/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        if (rs.has_content('_id')) {
            this.on_input(rs);
        } else {
            this.emit('validate_error', rs, 'No _id');
        }
    },

    on_input:function (rs) {
        var self = this;
        this.models.member.get(rs.req_props._id, function (err, member) {
            if (err) {
                self.emit('input_error', rs, err);
            } else if (member) {
                self.on_process(rs, member)
            } else {
                self.emit('input_error', rs, 'cannot find member ' + rs.req_props._id);
            }
        });
    },

    on_process:function (rs, member) {
        var self = this;

        self.on_output(rs, {member:member});
    }

}