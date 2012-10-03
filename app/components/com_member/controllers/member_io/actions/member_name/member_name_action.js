var util = require('util');
/**
 * This method exists to simply test whether a member name has been taken
 *
 * @TODO: DDOS / spam detection
 * @type {Object}
 */

module.exports = {

    on_validate: function(rs){
        if (!rs.has_content('member_name')){
            this.emit('validate_error', rs, 'no member name');
        }     else {
            this.on_input(rs);
        }
    },

    on_input: function(rs){
        var self = this;
        var mn = rs.req_props.member_name;
        this.models.member.find_one({member_name: mn}, function(err, member){
            if (err){
                self.emit('input_error', rs, err);
            } else if (member){
                console.log('member found: %s', util.inspect(member));
                self.on_process(rs, mn, member);
            } else {
                console.log('member NOT found');
                self.on_process(rs, mn, false);
            }
        });
    },

    on_process: function(rs, mn, member){
        if (member){
            rs.send({member_name: mn, found: true});
        } else {
            rs.send({member_name: mn, found: false});
        }
    },

    _on_error_go: true

}