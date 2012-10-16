var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'home_menu',
    exec:function (rs, menus, cb) {

        var self = this;

        this.add_menu_items(menus, 'nav', {
           weight: -1000,
            links: [
                {
                    label: 'Home',
                    type: 'link',
                    link: '/'
                }
            ]
        })
        cb();

    }

}