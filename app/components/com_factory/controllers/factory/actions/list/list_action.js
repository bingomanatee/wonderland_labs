var _ = require('underscore');
var util = require('util');
var fs = require('fs');

function _path(e){
    return e.path;
}

/* *************** MODULE ********* */

module.exports = {

    on_validate: function(rs){
        var self = this
        this.models.member.can(rs, ['create site elements'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to edit this site');
            }
        })
    },

    on_input: function(rs){
        var controllers = this.framework.frame_controllers();
        var components = this.framework.get_components();
        var actions = this.framework.actions();
        var statics = this.framework.get_resources('static_route');
        statics = _.sortBy(statics, function(s){
            return s.prefix;
        })
        this.on_process(rs, controllers, components, actions, this.framework, statics);
    },

    on_process: function(rs, controllers, components, actions, framework, statics){

        var routes = _.reduce(actions, function(r, a){
            return r.concat(a.get_routes(true));
        }, []);
        routes = _.sortBy(routes, function(route){
            return route.route;
        });

        var output = {
            framework: _path(framework),
            controllers:_.map(controllers, _path),
            components:_.map(components, _path),
            actions:_.map(actions, _path),
            statics: statics,
            routes: routes
        };

        this.on_output(rs, output);
    },

    _on_error_go: '/'
}