module.exports = {

    model:function () {
        return this.models.slideshow;
    },

    on_validate: function(rs){
        var self = this;
        self.models.member.can(rs, ['create slideshow', 'delete slideshow'], function (err, can) {
            if (can){
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'cannot create or delete slideshows');
            }
        });
    },

    on_input:function (rs) {
        var self = this;
        this.model().active(function (err, slideshows) {
            self.on_output(rs, {slideshows:slideshows});
        })
    },

    _on_error_go: '/'

}