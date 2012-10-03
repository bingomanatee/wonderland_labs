var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {

    /* ************* GET ************** */


    on_validate:function (rs) {
        rs.clear_session('member');
        rs.flash('info', 'you are now signed out. Goodbye!');
        rs.go('/');
    },

    _on_error_go:'/'

}