var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var request = require('request');

var Twitter = require('twitter');

/* ------------ CLOSURE --------------- */

/* -------------- EXPORT --------------- */

module.exports = {

    on_get_validate: function (context, done) {
        var member_model = this.model('member');
        member_model.ican(context, [
            "view tweets",
            "publish links"
        ], done, {
            go: '/',
            message: 'You do not have authorization to publish links',
            key: 'error'
        });

    }

}