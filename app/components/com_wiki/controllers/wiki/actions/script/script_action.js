var scope_menu = require('parsers/scope_menu');
var wiki_links = require('parsers/wiki_links');

module.exports = {

on_validate: function (rs){
	var self = this;
	self.on_input(rs)
},

on_input: function (rs){
	var self = this;
	var input = rs.req_props;
	self.on_process(rs, input)
},

on_process: function (rs,input){
	var self = this;
    var sm = scope_menu.toString();
    console.log('scope menu: %s', sm);
    var scope = input.scope ? input.scope : false;
    var wl = wiki_links.toString();

	self.on_output(rs, {parsers: ['marked_cb', sm, wl], scope: scope})
},

/* ****** GET ****** */

/* ****** POST ****** */

/* ****** PUT ****** */

/* ****** DELETE ****** */

   _on_error_go: true
}