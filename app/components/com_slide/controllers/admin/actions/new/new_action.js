module.exports = {
    on_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create slideshow'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_input(rs);
            } else {
                self.emit('validate_error', rs, 'You are not authorized to create slideshows. Dead or alive, you\'re coming with me!');
            }
        })
    },

    on_input: function(rs){
        this.on_output(rs);
    },

    _on_error_go: '/'
}