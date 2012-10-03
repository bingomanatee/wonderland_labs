var marked = require('marked');
var _ = require('underscore');
var util = require('util');
var _DEBUG;



module.exports = {

    model:function () {
        return this.models.wiki_article;
    },

    /* ****** GET ****** */

    on_validate:function (rs) {
        var self = this;
        self.on_input(rs)
    },

    on_input:function (rs) {
        var self = this;
        this.model().scope(rs.req_props.scope, function(err, scope){
            if (err){
                self.emit('input_error', rs, err);
            } else if (scope){
                self.model().articles_for_scope(rs.req_props.scope, function(err, articles){
                    if (err){
                        self.emit('input_error', rs, err);
                    } else if (articles){
                        self.on_process(rs, scope, articles);
                    } else {
                        self.on_process(rs, scope, []);
                    }
                })
            } else {
                self.on_process(rs,
                    {name: rs.req_props.scope,
                     title: rs.req_props.scope.replace('_', ' ')}, [])
            }
        })
    },

    on_process:function (rs, scope, items) {
        items = _.map(items, function(item){
            var item = item.toJSON();
            item.summary = marked(item.summary);
            return item;
        })
        var self = this;
        self.on_output(rs, {scope: scope, items: items})
    }
}