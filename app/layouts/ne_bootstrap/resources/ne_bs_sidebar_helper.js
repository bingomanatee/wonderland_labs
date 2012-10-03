var _ = require('underscore');
var util = require('util');
var fs = require('fs');

function _layout_name(rs, input) {
    var ln = false;
    if (input.hasOwnProperty('layout_name') && input.layout_name) {
        ln = input.layout_name
    } else {
        ln = rs.action.get_config('layout_name', false);
    }

    return ln;
}

/* *************** MODULE ********* */

module.exports = {

    init:function (rs, input, cb) {


        if (input.sidebar) return cb();

        var ln = _layout_name(rs, input);

        if ((!(ln == 'home')) && (!(ln == 'ne_bootstrap'))) {
            // only apply this sidebar to the layout that we know about.
            return cb();
        }

        var site_menu =
        {  title:'Site',
            links:[
                {link:'/', title:'Home'}
            ]}

        var member = rs.session('member');
        if (member) {
            var member_menu = {
                title:'Membership',
                links:[
                    {
                        title:'viewing as <br />' + member.member_name
                    },
                    {
                        link:'/sign_out',
                        title:'Sign Out'
                    }
                ]
            }

        } else {
            var member_menu = {
                title:'Membership',
                links:[
                    {
                        modal:'/sign_in',
                        title:'Sign in'
                    },
                    {
                        link:'/join_us',
                        title:'Join Us'
                    }
                ]
            }
        }

        input.sidebar = [site_menu, member_menu];

        if (member){
            rs.action.models.member.can(member, ['admin site'],function(err, can){

                if (can){
                    member_menu.links.push({link: '/admin/home', title: 'Administer'});
                }
                cb();
            })
        }  else {

            cb();
        }
    }
}