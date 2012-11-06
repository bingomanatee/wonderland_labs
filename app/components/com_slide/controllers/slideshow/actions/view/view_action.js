var _ = require('underscore');
var marked = require('marked');

function _slide_children(slide, slides, y){
    var children = _.filter(slides, function(s){

        return s.parent && (s.parent == slide._id.toString());
    })

    var c = _.reduce(children, function(series, child, i){
        var data = {
            slide: child,
            x: 2000 + (1000 * i),
            y: y,
            scale: 0.25
        };
        series.push(data);
        return series;

    }, [])

    // console.log('slide: %s, children: %s', slide.title, c.length);
    return c;
}

function _slide_series(slides){
    var root_slides = _.reject(slides, function(s){
        return s.parent;
    })

  //  console.log('slides: %s, root slides: %s', slides.length, root_slides.length);
    var y = -2000;
    return _.reduce(root_slides, function(series, slide){
        y += 2000;
        var data = {
            slide: slide,
            x: 0,
            y: y,
            scale: 1
        };
        series.push(data);
        return series.concat(_slide_children(slide, slides, y));
    }, [])
}

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

                 _.each(slides, function(s){
                    if (s.markdown){
                        var m = marked(s.content);
                       // console.log('marking %s to %s', s.content, m)
                        s.content = m;
                    }
                })
                var slide_series = _slide_series(slides);
                self.on_output(rs, {slideshow: slideshow, slides: slides, series: slide_series})
            });
        });
    },

    /* ****** POST ****** */

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    _on_error_go:'/' // the URL to redirect to on emitted errors. set to true to return errors in JSON
}