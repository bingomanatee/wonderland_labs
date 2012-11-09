var _ = require('underscore');
var marked = require('marked');

module.exports = {

    model:function () {
        return this.models.slide;
    },

    /* ****** GET ****** */

    on_validate:function (rs) {

        var self = this;

        this.models.member.can(rs,  ["edit slide"], function(err, can){
            if (can){

                self.on_input(rs)
            } else {
                self.emit('validate_error', rs, 'cannot edit slides')
            }
        })
    },

    on_input:function (rs) {
        var self = this;
        var id = rs.req_props._id;
        if (id) {
            self.on_process(rs, id)
        } else {
            self.emit('validate_error', rs, 'no id')
        }
    },

    on_process:function (rs, id) {
        var self = this;
        this.model().get(id, function (err, slide) {
            if (err) {
                return self.emit('process_error', rs, err);
            } else if (slide) {

                self.models.slideshow.get(slide.slideshow, function (err, slideshow) {
                    if (err) {
                        return self.emit('process_error', rs, err);
                    } else if (slideshow) {
                        slide.content = marked(slide.content);
                        self.on_output(rs, {slide:slide, slideshow:slideshow})
                    } else {
                        self.emit('process_error', rs, 'cannot find slideshow ' + slide.slideshow);
                    }
                })
            } else {
                self.emit('process_error', rs, 'no slide')
            }
        });
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/slideshows' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}