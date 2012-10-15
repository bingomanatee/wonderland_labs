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
        var input = rs.req_props;
        this.model().get(input._id, function(err, slideshow){
            if (err){
                self.emit('on_input', err);
            } else {
                self.on_process(rs, slideshow)
            }
        });
    },

    on_process:function (rs, slideshow) {
        var self = this;
        self.on_output(rs, {slideshow: slideshow})
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}