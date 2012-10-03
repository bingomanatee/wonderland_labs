var util = require('util');
var _DEBUG = false;
module.exports = {
    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        this.models.wizard_state.get_state(function(err, state){
            if (state != 'done'){
                rs.flash('error', 'You need to complete the <a href="/init_site">Site Wizard</a>.');

                rs.req_props.hero = {
                    more:{
                        title:'Start Site Wizard',
                        link:'/init_site'
                    },
                    title:'Please complete the site wizard',
                    text:'Where have all good men gone <br />' +
                        'And where are all the gods? <br />' +
                        'Where’s the street-wise Hercules <br />' +
                        'To fight the rising odds? <br />' +
                        ' <br />' +
                        'Isn’t there a white knight upon a fiery steed? <br />' +
                        'Late at night I toss and turn and dream of what I need'
                }
            }
            self.on_process(rs, rs.req_props);
        }, 'init_site', 'wizard') ;
    },

    on_process:function (rs, input) {
        if (!input) {
            input = {name:'World'}
        } else if (!input.name) {
            input.name = 'World';
        }
        /* ************* SIDEBER ****** */
            // note - this is a "proof of concept" that is sabotoged by the layout sidebar helper.

        if (input.sidebar) {
            input.sidebar = [
                {  title:'Sidebar title',
                    links:[
                        {link:'/section/1', title:'Section One'},
                        {link:'/section/2', title:'Section Two'}
                    ]}
            ];
        }
        /* ************* NAV ********** */

        if (input.nav) {
            input.nav = [
                {
                    dropdown:true,
                    title:'Sections',
                    links:[
                        {link:'/section/1', title:'Section One'},
                        {link:'/section/2', title:'Section Two'}
                    ]
                },
                {
                    title:'Section 3', link:'/section/3'
                }

            ]
        }


        if (_DEBUG) console.log('outputting %s', util.inspect(input))
        this.on_output(rs, input);
    }


}