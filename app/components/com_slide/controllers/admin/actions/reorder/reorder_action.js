var _ = require('underscore');
var Gate = require('gate');
var _DEBUG = false;
var util = require('util');

module.exports = {

    model:function () {
        return this.models.slide;
    },

    /* ****** GET ****** */

    /* ****** POST ****** */

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;
        var w = rs.req_props.weights;
        self.on_process(rs, w)
    },

    on_process:function (rs, weights) {
        var gate = Gate.create();
        var self = this;

        if (_DEBUG) console.log('weights: %s', util.inspect(weights));
        if (!weights){
            return rs.send({reweighted: false});
        }

        _.each(weights, function (value, id) {
            if (_DEBUG)   console.log('setting %s weight to %s', id, util.inspect(value));
            if (!value.hasOwnProperty('weight')){
                return;
            }
            value.weight = parseFloat(value.weight);

            self.model().model.findOneAndUpdate({_id:id}, { $set:value}, gate.latch())
        })

        gate.await(function () {
            rs.send({reweighted:true});
        })
    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}