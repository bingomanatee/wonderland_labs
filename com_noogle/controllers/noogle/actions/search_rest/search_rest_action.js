var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var elastic = require('elastic');

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        if (rs.has_content('query')){
            this.on_input(rs);
        } else {
            this.emit('validate_error', rs, 'query missing');
        }
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props.query);
    },

    on_process:function (rs, query) {
        var self = this;

        elastic.search(query, function(err, result){
            if (err){
                self.emit('process_error', rs, err);
            } else {
                rs.send(result);
            }
        })
    }

}