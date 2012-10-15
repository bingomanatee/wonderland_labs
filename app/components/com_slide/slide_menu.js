var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'admin_menu',
    exec:function (rs, menus, cb) {

        var self = this;

        rs.action.models.slideshow.active(function (err, slideshows) {

            var scope_links = _.map(slideshows, function (ss) {

                return {
                    label:ss.title,
                    type:'link',
                    link:'/slideshow/view/' + ss._id
                }

            });

            scope_links.unshift({
                label:'list',
                type:'link',
                link:'/slideshows'
            })

            //  console.log('scope links: %s', util.inspect(scope_links));

            self.add_menu_items(menus, 'nav', {
                label:'Slideshows',
                weight:0,
                links:scope_links
            }, true);


            rs.action.models.member.can(rs, [
                "create slideshow"], function (err, can_create) {

                var admin_slideshow_links = [];

                if (can_create) {
                    admin_slideshow_links.push({
                        link:'/admin/slideshows',
                        type:'link',
                        label:'Slideshows'
                    })
                    self.add_menu_items(menus, 'admin',
                        {
                            label:'Slideshows',
                            weight:300,
                            links:admin_slideshow_links

                        })
                }

                cb();
            })
        })
    }

}