var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
       this.on_process(rs, _.defaults(rs.req_props, {modal_title: 'Success', dest: '/'}));
    },

    on_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input);
    }

}