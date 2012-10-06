module.exports = {

    model: function(){
        return this.models.slide;
    },

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.model().for_slideshow(input.slideshow, function(err, slides){

            self.on_process(rs, slides);
        })
    },

    on_process:function (rs, slides) {
        rs.send({slides: slides})
    },

    /* ****** GET ****** */

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}