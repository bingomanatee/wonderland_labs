var tap = require('tap');
var NE = require('nuby-express');
var util = require('util');
var underscore = require('underscore');

var Menu = require('Menu');

var menu_view_helper_factory = require('./../resources/view_helpers/menu_view_helper');
var _nav_menu_items = [
    {label:'Content',
        weight:0,
        items:[
            {type:'link',
                label:'Home',
                link:'/'
            }
        ]
    },
    {label:'Search',
        weight:10000,
        items:[
            {type:'block',
                label:'Search',
                content:'<input type="text" onblur="document.location=\'/search?q=\' + encodeURI($(this).value())" />'
            }
        ]

    }
];



/* ******************* MENUS ************************ */

var nav_menu = new Menu({
    name:'nav_menu',
    _menu_names:['nav'],
    _items:function (rs, mn, cb) {
        cb(null, _nav_menu_items)
    }
});

var member_menu = new Menu({
    name:'user_menu',
    _member:true,
    _menu_names:['nav', 'member'],
    _items:function (rs, input, cb) {
    }
})

var frame = new NE.Framework();
frame.foo = 'bar';
frame.add_resource(nav_menu);
frame.add_resource(member_menu);
frame.add_resource(menu_view_helper_factory());

/* ****************** MENU CLASS ******************** */

tap.test('menu', function (t) {

    var rs = new NE.Req_State_Mock({frame:frame}, {
        framework:frame,
        session:{
            member:{
                member_name:'bob'
            }

        }
    });

    //  console.log('rs: %s', util.inspect(rs, true, 1));

    nav_menu.items(rs, 'nav', function (err, menus) {

        t.equals(menus.length, 2, '2 nav item');

        member_menu.items(rs, 'member', function (err, menus) {
            t.equal(menus.length, 1, 'has one menu');
            t.equal(menus[0].weight, -1000, 'weight of -1000');
            t.deepEqual(menus[0].items, [
                { type:'label', label:'Logged in as <br />bob' },
                { type:'link', label:'Sign Out', link:'/sign_out' }
            ], 'items found');

            member_menu.items(rs, 'nav', function (err, menus) {
                t.equal(menus.length, 1, 'has one menu');
                t.equal(menus[0].weight, -1000, 'weight of -1000');
                t.deepEqual(menus[0].items, [
                    { type:'label', label:'Logged in as <br />bob' },
                    { type:'link', label:'Sign Out', link:'/sign_out' }
                ], 'items found');

                member_menu.items(rs, 'foo', function (err, menus) {

                    console.log('menus for foo: %s', util.inspect(menus))
                    t.equals(menus.length, 0, 'foo menu has no items')

                    var rs2 = new NE.Req_State_Mock({}, {session:{}});

                    member_menu.items(rs2, 'nav', function (err, menus) {

                        t.equals(menus.length, 0, 'no nav menus from memer');
                        t.end();
                    }, true)

                }, true)
            }, true)
        }, true)

    })


})

/* ******************** VIEWS *************** */

var _expected_menus = {
    "nav": {
        "name": "nav",
        "title": "nav",
        "items": [
            {
                "label": "Member",
                "weight": -1000,
                "items": [
                    {
                        "type": "label",
                        "label": "Logged in as <br />bob"
                    },
                    {
                        "type": "link",
                        "label": "Sign Out",
                        "link": "/sign_out"
                    }
                ]
            },
            {
                "label": "Content",
                "weight": 0,
                "items": [
                    {
                        "type": "link",
                        "label": "Home",
                        "link": "/"
                    }
                ]
            },
            {
                "label": "Search",
                "weight": 10000,
                "items": [
                    {
                        "type": "block",
                        "label": "Search",
                        "content": "<input type=\"text\" onblur=\"document.location='/search?q=' + encodeURI($(this).value())\" />"
                    }
                ]
            }
        ]
    },
    "member": {
        "name": "member",
        "title": "member",
        "items": [
            {
                "label": "Member",
                "weight": -1000,
                "items": [
                    {
                        "type": "label",
                        "label": "Logged in as <br />bob"
                    },
                    {
                        "type": "link",
                        "label": "Sign Out",
                        "link": "/sign_out"
                    }
                ]
            }
        ]
    }
}

tap.test('view helper', function (t) {

    var rs = new NE.Req_State_Mock({frame:frame}, {
        framework:frame,
        session:{
            member:{
                member_name:'bob'
            }

        }
    });

    t.deepEqual(rs.session('member'), {member_name:'bob'}, 'member in session')

    var vh = frame.get_resource('view_helper', 'menu_view_helper');

    t.ok(vh, 'view helper retrieved');

    var input = {menus:['nav', 'member']};

    vh.init(rs, input, function () {
        console.log('--------------- input: %s', JSON.stringify(input.menus, true, 4));

        t.deepEqual(input.menus, _expected_menus, 'retrieved menus');
        t.end();
    })


})

/* ******************** VIEWS NO MEMBER *************** */

var _expected_menus_NM = {
    "nav": {
        "name": "nav",
        "title": "nav",
        "items": [
            {
                "label": "Content",
                "weight": 0,
                "items": [
                    {
                        "type": "link",
                        "label": "Home",
                        "link": "/"
                    }
                ]
            },
            {
                "label": "Search",
                "weight": 10000,
                "items": [
                    {
                        "type": "block",
                        "label": "Search",
                        "content": "<input type=\"text\" onblur=\"document.location='/search?q=' + encodeURI($(this).value())\" />"
                    }
                ]
            }
        ]
    },
    "member": {
        "name": "member",
        "title": "member",
        "items": []
    }
}

tap.test('view helper', function (t) {

    var rs = new NE.Req_State_Mock({frame:frame}, {
        framework:frame,
        session:{

        }
    });

    var vh = frame.get_resource('view_helper', 'menu_view_helper');

    t.ok(vh, 'view helper retrieved');

    var input = {menus:['nav', 'member']};

    vh.init(rs, input, function () {
     //   console.log('--------------NO MEMBER- input: %s', JSON.stringify(input.menus, true, 4));

        t.deepEqual(input.menus, _expected_menus_NM, 'retrieved menus');
        t.end();
    })


})