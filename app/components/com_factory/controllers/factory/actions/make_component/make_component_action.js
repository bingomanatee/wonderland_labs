var _ = require('underscore');
var util = require('util');
var _DEBUG = false;
var nuby_factory = require('nuby-factory');
var make = require('make');

module.exports = {

    on_validate:function (rs) {
        if (rs.has_content('comp_name')) {
            this.on_input(rs);
        } else {
            rs.flash('error', 'You must supply a name for your new component');
            rs.go('/make');
        }
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);
    },

    on_process:function (rs, input) {
        if (_DEBUG) console.log(util.inspect(input));
        var com = new nuby_factory.Component({name:input.comp_name, file_path:input.root + '/components'});
        if (input.controller1) make.controller( input.controller1, make.parse_actions( input, 1), com);
        if (input.controller2) make.controller( input.controller1, make.parse_actions( input, 2), com);
        if (input.controller3) make.controller( input.controller1, make.parse_actions( input, 3), com);

        com.render(function () {
            rs.flash('info', util.format('Component %s created', com.get_path()));
            rs.go('/admin/factory/make');
        });
    }

}