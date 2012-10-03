var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var validate_admin = require('validate_admin');
var wizard_factory = require('wizard_factory');

var _DEBUG = false;

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {

        var self = this;
        if (!validate_admin(rs, 'get', this)) {
            return;
        }

        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        var coms = _.map(this.framework.components, function (com) {
            return {name:com.name, path:com.path};
        })

        console.log('com: %s', util.inspect(coms));
        this.on_get_process(rs, _.extend({coms:coms}, rs.req_props));
    },

    on_get_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    },

    // note - there is no "on_get_output()' function because on_output is the normal output for get

    _on_error_go:true,

    /* ********************* POST ********************** */

    on_post_validate:function (rs) {

        var self = this;
        if (!validate_admin(rs, 'get', this)) {
            return;
        }

        var root_dir = rs.req_props.com.path;
        fs.exists(root_dir, function (exists) {
            if (exists) {
                self.on_post_input(rs);
            } else {
                if (_DEBUG) console.log('bailing - the target path does not exist');
                return self.emit('process_error', rs, 'cannot find path ' + root_dir);
            }
        });
    },

    on_post_input:function (rs) {
        console.log('publishing %s', util.inspect(rs.req_props));
        var self = this;
        this.models.wizard.get(rs.req_props.wizard, function (err, wizard) {
            if (err) {
                console.log('error on wizard get');
                self.emit('input_error', rs, err);
            } else if (wizard) {
                self.models.wizard_step.find_wizard_steps(wizard._id, function (err, steps) {
                    if (err) {
                        console.log('error on wizard step get');
                        self.emit('input_error', rs, err)
                    } else {
                        console.log('%s steps found', steps.length);
                        self.on_post_process(rs, rs.req_props, rs.req_props.com, wizard, steps);
                    }
                })
            } else {
                self.emit('input_error', rs, 'cannot find wizard ' + rs.req_props.wizard);
            }
        })
    },

    on_post_process:function (rs, input, com, wizard, steps) {
        wizard_factory.make_wizard (com.path, wizard, steps, true, function () {
            rs.send({success:true, com:com});
        });
    },

    _on_post_error_go:true
}