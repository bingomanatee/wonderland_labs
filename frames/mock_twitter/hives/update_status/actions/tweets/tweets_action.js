var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: to display a user's tweets
 */

/* -------------- EXPORT --------------- */

module.exports = {

    on_validate: function(context, done){
        if (!(context.user)){
            done('must have user or user_id');
        }     else {
            done();
        }
    },

    on_output: function(context, done){
        context.$out.set('user', context.user);
        done();
    }

}