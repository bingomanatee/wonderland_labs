var _DEBUG = false;
var util = require('util');
var _ = require('underscore');
module.exports = {

    model:function () {
        return this.models.wizard_state;
    },

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;
        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        this.models.wizard_state.get_state(function (err, state) {
            self.on_get_process(rs, state);
        }, 'init_site');
    },

    on_get_process:function (rs, state) {
        this.on_output(rs, {state:state});
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props, rs.req_props.hasOwnProperty('next'), rs.req_props.hasOwnProperty('prev'));
    },

    on_post_process:function (rs, props, next, prev) {
        var self = this;
        if (_DEBUG) console.log('next: %s, prev: %s', util.inspect(next), util.inspect(prev));
        // note - no input here.
        if (next) {
            self.model().get_state(function (err, state) {
                var fb_options = state.facebook_app;
                var uun_options = state.unix_username;
                var admin_member = state.admin_member;

                var save_options = {};
                _.extend(save_options, fb_options);
                _.extend(save_options, uun_options);

               if (_DEBUG) console.log('setting options %s', util.inspect(save_options));
                self.models.site_options.set_options(save_options, function (err, done) {
                    if (err) {
                        self.emit('process_error', rs, err);
                    } else {
                        self.models.member_role.define_role(function (err, role) {
                            if (err) {
                                self.emit('process_error', rs, err);
                            } else {
                                //@TODO: make sure we're not overwriting existing member
                                admin_member.roles = [role.name];
                                var pass = admin_member.pass;
                                delete admin_member.pass;
                                delete admin_member.pass2;

                                self.models.member.put(admin_member, function (err, admin) {
                                    if (err) {
                                        self.emit('process_error', rs, err);
                                    } else if (admin) {
                                        self.models.member.set_member_pass(function (err2, am) {
                                            if (err2){
                                                self.emit('process_error', rs, err2);
                                            } else {
                                                self.model().set_state(function () {
                                                    rs.flash('info', 'You have completed the site wizard. Your administrative member is <b>' + admin.member_name + '</b>');
                                                    rs.go('/init_site/done');
                                                }, 'done', 'init_site', 'wizard');
                                            }
                                        }, admin, pass);

                                    } else {
                                        self.emit('process_error', rs, 'cannot create admin member. darn.')
                                    }
                                })
                            }
                        }, 'site admin', '*');
                    }
                });

            }, 'init_site')


        } else if (prev) {
            rs.go('/init_site/')
        } else {
            self.on_output(rs, {})
        }

    },

    _on_post_error_go: '/init_site/confirm',

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}