var _DEBUG = false;
var util = require('util');
var _ = require('underscore');

var PREFIX = '/js/dwmi/';
var map = {
    jqueryui:PREFIX + 'jquery-ui-1.8.23.custom.min.js',
    underscore:PREFIX + 'underscore-min.js',
    less:PREFIX + 'less-1.1.3.min.js',
    bootstrap: PREFIX + 'bootstrap.min.js',
    angular: PREFIX + 'angular-1.0.2/angular.min.js',
    angular_resource: PREFIX + 'angular-1.0.2/angular-resource.js'
};

function _js_finder(js_file) {
    if (map[js_file]) return map[js_file];
    var alias = false;
    if (/underscore[^\/]*js$/i.test(js_file)) {
        alias = map.underscore;
    } else if (/less[^\/]*.js$/i.test(js_file)) {
        alias = map.less;
    } else if (/jquery-ui[^\/]*js$/i.test(js_file)) {
        alias = map.jqueryui
    } else if (/jquery-1[\w]*js$/i.test(js_file)) { // note - this will undo some plugins. Use with care.
        alias = map.jqueryui
    } else if (/bootstrap[^\/]*js/i.test(js_file)) {
        alias = map.bootstrap;
    } else if (/angular[^\/]*resource[^\/]*js/i.test(js_file)) {
        alias = map.angular_resource;
    }else if (/angular[^\/]*js/i.test(js_file)) {
        alias = map.angular;
    }

    if (alias) {
       if (_DEBUG) console.log('dudewheresmyinternet >> %s ... %s', js_file, alias);
        map[js_file] = alias;
        return alias;
    } else {
        return js_file;
    }

}

function _localize(js_array) {
    return _.map(js_array, _js_finder);
}

module.exports = {
    weight:100,
    name: 'dudewheresmyinternet',
    init:function (rs, input, cb) {
        if (rs.action.get_config('dudewheresmyinternet')) {
            if (input.javascript) {
                input.javascript = _localize(input.javascript);
            }
            if (input.javascript_head) {
                input.javascript_head = _localize(input.javascript_head);
            }
            input.offline = true;
        } else{
            if (_DEBUG) console.log('DUDEHEREsmyINTERNET')
            input.offline = false;
        }
        cb();
    }
}