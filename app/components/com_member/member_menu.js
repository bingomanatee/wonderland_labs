var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'member_menu',
    title:'Members',
    exec:function (rs, menus, cb) {
        var self = this;

        if (!menus.member) {
            return cb();
        }

        try {
            var member = rs.session('member');
        } catch (err) {
            console.log('session error: %s', err.message);
            cb(err);
        }

        if (member) {
            this.add_menu_items(menus, 'member', {
                label:'Member',
                weight:-1000,
                links:[
                    {
                        type:'label',
                        label:'Logged in as <br />' + member.member_name
                    },

                    {
                        type:'link',
                        label:'Sign Out',
                        link:'/sign_out'
                    }

                ]
            });

            rs.action.models.member.can(rs, [ "admin members"], function (err, can) {
                if (can) {
                    self.add_menu_items(menus, 'admin',
                        {
                            label:'Membership',
                            weight:100,
                            links:[
                                {
                                    link:'/admin/members',
                                    type:'link',
                                    label:'Members'
                                },
                                {
                                    link:'/admin/member_roles',
                                    type:'link',
                                    label:'Roles'
                                },
                                {
                                    link:'/admin/member_tasks',
                                    type:'link',
                                    label:'Tasks'
                                }
                            ]
                        }

                    )

                }

                cb();

            })

        } else {
            this.add_menu_items(menus, 'member', {
                label:'Sign In or Join Us!',
                weight:-1000,
                links:[
                    {
                        type:'modal',
                        link:'/sign_in',
                        label:'Sign in'
                    },
                    {
                        type:'link',
                        link:'/join_us',
                        label:'Join Us'
                    }
                ]
            })

            cb();

        }

    }
}