module.exports = {

    model:function () {
        return this.models.slideshow;
    },

    on_validate: function(rs){
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        this.model().active(function (err, slideshows) {
            self.on_output(rs, {slideshows:slideshows});
        })
    }

}