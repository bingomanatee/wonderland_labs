module.exports = {

on_validate: function (rs){
	var self = this;
	self.on_input(rs)
},

on_input: function (rs){
	var self = this;
	var input = rs.req_props;
	self.on_process(rs, input.search, input.start, input.size);
},

on_process: function (rs, search, start, size){
    if (!size){
        size = 500;
    }
    if (!start){
        start = 0;
    }
    if (!search){
        search = '';
    }
	var self = this;
	self.on_output(rs, {params:{search: search, start: start, size: size}})
},

/* ****** GET ****** */

/* ****** POST ****** */

/* ****** PUT ****** */

/* ****** DELETE ****** */

    _on_error_go: '/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}