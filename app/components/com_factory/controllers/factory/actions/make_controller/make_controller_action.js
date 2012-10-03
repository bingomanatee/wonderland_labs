var _ = require('underscore');
var util = require('util');
var _DEBUG = false;
var make = require('make');

module.exports = {

    on_validate:function (rs) {
        if (rs.has_content('con_name')) {
            this.on_input(rs);
        } else {
            rs.flash('error', 'You must supply a name for your new controller');
            rs.go('/make');
        }
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);

    },

    on_process:function (rs, input) {
        if (_DEBUG) console.log('MAKING CONTROLLER: ++++++++ %s', util.inspect(input));
        switch (input.type) {
            case 'component':
                input.root += '/controllers';
                break;
        }

        var con = make.controller(input.con_name, make.parse_actions(input), input.root);
        con.config.route_prefix = '/' + con.name;

        con.render();
        rs.flash('info', util.format('Controller %s created', con.get_path()));
        rs.go('/admin/factory/make');
    }

}