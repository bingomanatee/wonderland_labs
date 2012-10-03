var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */

    on_validate:function (rs) {
        var self = this;
        this.models.member.can(rs, ['create scope'], function (err, can) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else if (can) {
                self.on_output(rs);
            } else {
                self.emit('validate_error', rs, 'you are not authorized to create scopes')
            }
        })
    },

    _on_validate_error_go:'/',
    _on_error_go:'/admin/wiki/scopes'
}