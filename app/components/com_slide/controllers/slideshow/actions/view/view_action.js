module.exports = {

    model:function () {
        return this.models.slideshow;
    },

    /* ****** GET ****** */

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;
        var id = rs.req_props._id;
        self.on_process(rs, id)
    },

    on_process:function (rs, id) {
        var self = this;
        this.model().get(id, function(err, slideshow){
            self.models.slide.for_slideshow(id, function(err, slides){
                if (!slides){
                    slides = [];
                }
                self.on_output(rs, {slideshow: slideshow, slides: slides})
            });
        });
    },


    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}