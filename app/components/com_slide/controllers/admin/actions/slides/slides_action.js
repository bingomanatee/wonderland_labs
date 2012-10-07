var _ = require('underscore')
module.exports = {

    /* ****** GET ****** */

    model:function () {
        return this.models.slide;
    },

    on_get_validate:function (rs) {
        var self = this;
        self.on_get_input(rs)
    },

    on_get_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.model().for_slideshow(input.slideshow, function (err, slides) {

            self.on_get_process(rs, slides);
        })
    },

    on_get_process:function (rs, slides) {
        rs.send(slides)
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        self.on_post_input(rs);
    },

    on_post_input:function (rs) {
        var self = this;
        var slide = rs.req_props;
        this.model().active().where('slideshow').equals(rs.req_props.slideshow).select('weight').exec(function (err, slides) {
            var weight = _.reduce(slides, function (w, s) {
                return Math.max(w, s.weight);
            }, 0)
            slide.weight = weight + 1;
            self.on_post_process(rs, slide)
        })
    },

    on_post_process:function (rs, slide) {
        var self = this;
        this.model().put(slide, function (err, slide_record) {
            rs.send(slide_record);
        })
    },

    /* ****** PUT ****** */

    on_put_validate:function (rs) {
        var self = this;
        self.on_put_input(rs);
    },

    on_put_input:function (rs) {
        var self = this;
        var slide = rs.req_props;
        self.on_put_process(rs, slide)
    },

    on_put_process:function (rs, slide) {
        var self = this;
        console.log('revising slide ', slide);
        this.model().revise(slide, function (err, slide_record) {
            rs.send(slide_record);
        })
    },
    /* ****** DELETE ****** */

    on_delete_validate:function (rs) {
        var self = this;
        self.on_delete_input(rs);
    },

    on_delete_input:function (rs) {
        var self = this;
        var id = rs.req_props._id;
        self.on_delete_process(rs, id)
    },

    on_delete_process:function (rs, id) {
        var self = this;
        this.model().delete(id, function(){
            rs.send({deleted: id});
        }, true)
    },

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}