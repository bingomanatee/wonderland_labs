module.exports = {

    model:function () {
        return this.models.slideshow;
    },

    /* ****** GET ****** */

    on_get_validate:function (rs)   {
        var self = this;
        self.on_get_input(rs)
    },
//@TODO: add slides
    on_get_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        if (rs.has_content('_id')){
            this.model().get(rs.req_props._id, function(err, ss){
               rs.send(ss);
            });
        } else {
            this.model().active(function (err, slideshows) {
                if (err) {
                    self.emit('inpput_error', rs, err);
                } else {
                    self.on_get_process(rs, {slideshows:slideshows});
                }
            })
        }
    },

    on_get_process:function (rs, input) {
        var self = this;
        rs.send(input);
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        if (rs.has_content('slideshow')) {
            self.models.member.can(rs, ['create slideshow'], function (err, can) {
                if (can) {
                    self.on_post_input(rs);
                } else {
                    self.emit('validate_error', rs, 'cannot create slideshows');
                }
            })
        } else {
            this.emit('validate_error', rs, 'no slideshow found');
        }
    },

    on_post_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_post_process(rs, input)
    },

    on_post_process:function (rs, input) {
        var self = this;
        this.model().put(input.slideshow, function (err, new_slideshow) {
            rs.send({slideshow:new_slideshow});
        })
    },

    /* ****** PUT ****** */

    on_put_validate:function (rs) {
        var self = this;
        if (rs.has_content('slideshow')) {
            self.models.member.can(rs, ['create slideshow'], function (err, can) {
                if (can) {
                    self.on_put_input(rs)
                }
                else {
                    self.emit('validate_error', rs, 'cannot create slideshows');
                }
            });

        } else {
            this.emit('validate_error', rs, 'no slideshow found');
        }
    },

    on_put_input:function (rs) {
        var self = this;
        var slideshow = rs.req_props.slideshow;
        self.on_put_process(rs, slideshow)
    },

    on_put_process:function (rs, slideshow) {
        var self = this;
        this.model().revise(slideshow, function (err, new_slideshow) {
            if (err){
                self.emit('process_error', rs, err);
            } else {
                rs.send({slideshow:new_slideshow});
            }
        })
    },

    /* ****** DELETE ****** */

    on_delete_validate:function (rs) {
        var self = this;
        if (rs.has_content('_id')){
            self.models.member.can(rs, ['delete slideshow'], function (err, can) {
                self.on_delete_input(rs)
            });
        } else {
            self.emit('validate_error', rs, 'no _id');
        }
    },

    on_delete_input:function (rs) {
        var self = this;
        var id = rs.req_props._id;

        self.model().get(id, function(err, ss){
            if (err){
                self.emit('input_error', rs, err);
            } else if (ss){
                self.on_delete_process(rs, ss);
            } else {
                self.emit('input_error', rs, 'cannot find ss ' + id);
            }
        });
    },

    on_delete_process:function (rs, ss) {
        var self = this;
        this.model().delete(ss.id, function(err, result){
            rs.send(result);
        }, true);
    },

    _on_error_go:true // return errors via REST
}