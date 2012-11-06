module.exports = {

    model:function () {
        return this.models.slide;
    },

    /* ****** GET ****** *

    on_get_validate:function (rs) {
        var self = this;
        self.on_get_input(rs)
    },

    on_get_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_get_process(rs, input)
    },

    on_get_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input)
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        this.models.member.can(rs,  "edit slide", function(err, can){
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                 if ( rs.has_content('_id')){
                     self.on_post_input(rs)
                 } else {
                     self.emit('validate_error', rs, '_id required');
                 }
             } else {
                 self.emit('validate_error', rs, 'You cannot edit slides');
             }

         })

    },

    on_post_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        this.model().get(input._id, function(err, slide){
            if (err){
                self.emit('input_error', rs, err);
            } else if (slide){
                self.on_post_process(rs, slide, input.content);
            } else {
                self.emit('input_error', rs, 'slide not found: ' + input._id);
            }
        })
    },

    on_post_process:function (rs, slide, content) {
        var self = this;
        console.log('switching content for slide %s from %s to %s', slide._id, slide.content, content);

        this.model().archive(slide, ['content'], {content: content}, function(err, new_slide){
            rs.send({slide: new_slide})
        })
    },

    /* ****** PUT ****** *

    on_put_validate:function (rs) {
        var self = this;
        self.on_put_input(rs)
    },

    on_put_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_put_process(rs, input)
    },

    on_put_process:function (rs, input) {
        var self = this;
        rs.send(input)
    },

    /* ****** DELETE ****** *

    on_delete_validate:function (rs) {
        var self = this;
        self.on_delete_input(rs)
    },

    on_delete_input:function (rs) {
        var self = this;
        var input = rs.req_props;
        self.on_delete_process(rs, input)
    },

    on_delete_process:function (rs, input) {
        var self = this;
        rs.send(input)
    },
    */

    _on_error_go: true// the URL to redirect to on emitted errors. set to true to return errors in JSON
}