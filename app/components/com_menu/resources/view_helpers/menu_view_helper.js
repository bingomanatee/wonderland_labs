var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

function _weight(item) {
    return item.weight;
}

function _fetch_layout(rs, input) {

    if (input.hasOwnProperty('layout_name') && input.layout_name) {
        var name = input.layout_name;
    } else {
        var name = rs.action.get_config('layout_name', 'NO LAYOUT')
    }

    if (!name) {
        return false;
    } else {
        return rs.framework.get_resource('layout', name);
    }

}

function _filter_menus(m) {
    if (_.isString(m)) {
        return {
            name:m,
            title:m.replace(/_/i, ' '),
            items:[]
        }
    } else {
        if (m.items) {
            var items = m.items.slice(0);
        } else {
            var items = [];
        }
        return _.extend({}, m, {items:items});
    }
}

var _menus = false;

var menu_view_helper = new NE.helpers.View({
    name:'menu_view_helper',
    weight:100,

    init:function (rs, input, cb) {
        if (_DEBUG)  console.log('starting menu view helper for %s', util.inspect(input));
        if (!rs) {
            throw new Error('no rs');
        }

        /* *************** MENUS PASSED THORIUGH FROM ACTIONS ****** */

        var menus = input.menus ? _.map(input.menus, _filter_menus) : [];

        /* **************** PULL MENUS DEFINED IN LAYOUTS ********* */

        var layout = _fetch_layout(rs, input);
        if (layout) {
            var layout_menus = layout.direct_config('menus');
            if (_DEBUG)  console.log('layout menus: %s', util.inspect(layout_menus));
            if (layout_menus) {
                menus = menus.concat(_.map(layout_menus, _filter_menus));
            }
        } else {
            if (_DEBUG)  console.log('no layout');
        }

        if (!menus.length) {
            if (_DEBUG) console.log('no menus');
            if (!input.menus) {
                input.menus = {};
            }

            return cb();
        }

        /* **************** ENSURE UNQIUENESS OF MENUS BY NAME ********* */

      if (_DEBUG)  console.log('initial menus: %s', JSON.stringify(menus))

        menus = _.reduce(menus, function (comp_menus, menu) {
            var dupe = comp_menus[menu.name];

            if (dupe) {
                dupe.items = dupe.items.concat(menu.items);
            } else {
                comp_menus[menu.name] = menu;
            }

            return comp_menus

        }, {});

       if (_DEBUG) console.log('deduped menus: %s', JSON.stringify(menus))

        //   console.log('NE --- MVH %s', util.inspect(NE));
        var Gate = NE.deps.support.nakamura_gate;

        var gate = Gate.create();

        if (!_menus) {
            _menus = rs.action.framework.get_resources('menu');
        }

        _.each(_menus, function (menu_resource) {
            menu_resource.exec(rs, menus, gate.latch(), input);
        });

        gate.await(function () {
            _.each(menus, function(menu){
                menu.items = _.sortBy(menu.items, _weight);
            });

            input.menus = menus;
            cb();
        });

    }

});

module.exports = function () {
    return menu_view_helper;
}