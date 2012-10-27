var marked = require('marked');
var _ = require('underscore');
var util = require('util');
var _DEBUG;

function _art(art){
    return {
        name: art.name,
        title: art.title,
        scope: art.scope,
        tags: art.tags.slice(0),
        summary: art.summary
    }
}

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

        var tag_items = _.reduce(items, function(tag_items, item){
           if (item.tags && item.tags.length){
               _.each(item.tags, function(tag){
                   if (tag_items.tags[tag]){
                       tag_items.tags[tag].push(_art(item))
                   } else {
                       tag_items.tags[tag] = [_art(item)]
                   }
               })
           } else {
               tag_items.untagged.push(_art(item));
           }


            return tag_items;
        }, {tags: {}, untagged: []});

        tag_items.tags = _.map(tag_items.tags, function(items, tag){
            return {tag: tag, items: items, count: items.length}
        });

        tag_items.tags = _.sortBy(tag_items.tags, function(tags){
            return tags.count;
        })

        console.log('tag_items: %s, ', util.inspect(tag_items));
        self.on_output(rs, {scope: scope, _: _, tag_items: tag_items})
    }
}