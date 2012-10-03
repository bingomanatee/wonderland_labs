var elastic = require('elastic');

module.exports = {

on_validate: function (rs){
	var self = this;
	self.on_input(rs)
},

on_input: function (rs){
	var self = this;
	var input = rs.req_props;
    elastic.search(input.search, function(err, results){
        if (err){
            self.emit('input_error', rs, err);
        } else {
            self.on_process(rs, JSON.parse(results), input.format);
        }
    })
},

on_process: function (rs,results, format){
	var self = this;

    if (format == 'json'){
        rs.send(results);
    } else {
        self.on_output(rs,{results: results})
    }
},

/* ****** GET ****** */

/* ****** POST ****** */

/* ****** PUT ****** */

/* ****** DELETE ****** */

    _on_error_go: '/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}