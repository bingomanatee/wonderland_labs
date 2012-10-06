var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'admin_menu',
    exec:function (rs, menus, cb) {

        var self = this;

        rs.action.models.wiki_article.scopes(function (err, scopes) {

            var scope_links = _.map(scopes, function (scope) {

                return {
                    label:scope.title,
                    type:'link',
                    link:'/wiki/s/' + scope.name
                }

            });

          //  console.log('scope links: %s', util.inspect(scope_links));

            self.add_menu_items(menus, 'nav', {
                label:'Wikis',
                weight:0,
                links:scope_links
            }, true);


            rs.action.models.member.can(rs, [
                "create article"], function (err, can_create) {


                rs.action.models.member.can(rs, [
                    "edit any scope"], function (err, can) {

                    var wiki_links = [
                        {
                            link:'/admin/wiki/scopes',
                            type:'link',
                            label:'Scopes'
                        },
                        {
                            link:'/admin/wiki/articles',
                            type:'link',
                            label:'Articles'
                        }
                    ];

                    if (can_create){
                        wiki_links.push({
                            link: '/admin/wiki/import',
                            type: 'link',
                            label: 'Import Wiki'
                        })
                    }

                    if (can) {
                        self.add_menu_items(menus, 'admin',
                            {
                                label:'Wiki',
                                weight:200,
                                links:wiki_links

                            })
                    }

                    if (menus.article && rs.req_props.article) {
                        var in_links = _.map(rs.req_props.article.linked_from, function (link) {
                            return {
                                type:'link',
                                label:link.title,
                                link:'/wiki/a/' + link.scope + '/' + link.name
                            }
                        });

                        self.add_menu_items(menus, 'article', {
                            label:'Links to this article',
                            items:in_links
                        });
                        cb();

                    } else {
                        cb();
                    }
                })

            })
        })
    }

}