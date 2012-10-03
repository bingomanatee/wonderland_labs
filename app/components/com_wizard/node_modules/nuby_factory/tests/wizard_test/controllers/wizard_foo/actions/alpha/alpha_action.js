module.exports = {

/* ****** GET ****** */

on_get_validate: function (rs){
	var self = this;
	self.on_get_input(rs)
},

on_get_input: function (rs){
	var self = this;this.models.wizard_state.get_state(function (err, state) {self.on_get_process(rs, state);}, 'wizard_foo', 'alpha');
},

on_get_process: function (rs,input){
	var self = this;
	self.on_output(rs,input)
},

/* ****** POST ****** */

on_post_validate: function (rs){
	var self = this;
	self.on_post_input(rs)
},

on_post_input: function (rs,prev,next){
	if (next) {rs.go("/wizard_foo/alpha");
	} else if (prev) { rs.go("/wizard_foo/beta");
	} else { self.on_output(rs, {});
	}
},

on_post_process: function (rs,next,prev){
	var self = this;
	this.models.wizard_state.set_state(	function (err,state){
	if (next) {rs.go("/wizard_foo/alpha");
	} else if (prev) {rs.go("/wizard_foo/beta");
	} else { self.on_output(rs, {});
	}
}	)
},

/* ****** PUT ****** */

/* ****** DELETE ****** */

    a:'a' // last comma
}