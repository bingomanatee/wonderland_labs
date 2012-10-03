var _DEBUG = true;
var util = require('util');
var fs = require('fs');
var path = require('path');

module.exports = {

    on_validate: function(rs){

        if (_DEBUG) console.log('wizard props: %s', util.inspect(rs.req_props));

        if (!rs.has_content('name')){
            return on_validate_error(rs, 'no name');
        }

        this.on_input(rs);
    },

    on_input: function(rs){
        var self = this;
        this.models.wizard.get_name(rs.req_props.name, function(err, wizard){
            if (err){
                self.emit('input_error',rs, err);
            } else if (wizard){
                self.models.wizard_step.find({wizard: wizard._id}).asc('order').exec(function(err, steps){
                    if (err){
                        self.emit('input_error',rs, err);
                    } else {
                        switch (rs.req_props.format){
                            case 'package':
                                var js_path = path.resolve(__dirname + '/../support/static/js/wizard/NE_WIZARD.js');
                                fs.exists(js_path, function(exists){
                                    if (!exists){
                                        throw new Error(util.format('cannot find %s', js_path));
                                    }
                                    fs.readFile(js_path, 'utf8', function(err, script){
                                        self.on_process(rs, wizard, steps, script);
                                    })
                                })

                                break;

                            case 'json':
                                rs.send({wizard: wizard, steps: steps});
                                break;

                            default:
                                self.on_process(rs, wizard, steps);

                        }
                    }

                })
            } else {
                self.emit('input_error',rs, new Error('cannot find wizard', + rs.req_props._id));
            }
        })
    },

    on_process: function(rs, wizard, steps, script){
       // console.log('wizard: %s, steps: %s', util.inspect(wizard), util.inspect(steps))
        this.on_output(rs, {wizard: wizard, steps: steps, script: script});
    },

    _on_error_go: true

}