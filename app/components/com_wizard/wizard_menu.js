var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'admin_menu',
    exec:function (rs, menus, cb) {

        var self = this;
// "create site elements"
        rs.action.models.member.can(rs, [  "create site elements"], function (err, can) {
            if (can) {
                self.add_menu_items(menus, 'admin',
                    {
                        label:'Wizard',
                        weight:350,
                        links:[
                            {
                                link:'/admin/wizards',
                                label:'Wizards',
                                type:'link'
                            }
                        ]
                    })

            }

            cb();

        })
    }

}