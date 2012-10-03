var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {
        var self = this;
        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        this.on_get_process(rs, rs.req_props);
    },

    on_get_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    },

    // note - there is no "on_get_output()' function because on_output is the normal output for get

    _on_get_error_go: true,

    /* *************** PUT RESPONSE METHODS ************** */

    on_put_validate:function (rs) {
        var self = this;
        this.on_put_input(rs);
    },

    on_put_input:function (rs) {
        var self = this;
        this.on_put_process(rs, rs.req_props);
    },

    on_put_process:function (rs, input) {
        var self = this;
        this.on_put_output(rs, input);
    },

    on_put_output: function(rs, output){
        this.on_output(rs, output);
    },

    _on_put_error_go: true,

    a: true
}