var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

module.exports = {

    on_validate:function (rs) {
        console.log('making action: %s', util.inspect(rs.req_props));
        this.on_input(rs);
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);
    },

    on_process:function (rs, input) {
        var make = require('make');
        if (_DEBUG) console.log('MAKING ACTIONS: ++++++++ %s', util.inspect(input));
        input.root += '/actions';

        var actions = make.actions(input, input.root);
        actions.forEach(function(act){
            act.render();
        })
        rs.flash('info', util.format('Actions created: %s. You will need to restart your ' +
            'application to use these actions. You may also want to chmod the new files' +
            'to attain editing privileges.', input.root));
        rs.go('/admin/factory/make');
    }

}