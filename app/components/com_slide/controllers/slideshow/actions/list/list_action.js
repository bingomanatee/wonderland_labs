module.exports = {

    model:function () {
        return this.models.slideshow;
    },

    on_input:function (rs) {
        var self = this;
        this.models.active(function (err, slideshows) {
            self.on_input(rs, {slideshows:slideshows});
        })
    }
}