var util = require('util');
var _ = require('underscore');

var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;
var Gate = NE.deps.support.nakamura_gate;

var wiki_links = require('./../../node_modules/parsers/wiki_links');
var links_in_text = require('./../../node_modules/parsers/links_in_text');
var _DEBUG = false;
var _DEBUG_SET = true;

var _model;

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var arch_schema_def = {
            title:'string',
            author:{ type:mongoose_inject.Schema.Types.ObjectId, ref:'member' },
            write_date:'date',
            summary:'string',
            content_type:{type:'string', enum:['text', 'html', 'json', 'marked'], default: 'marked'}, // currently not used
            content:'string'
        }

        var arch_fields = _.keys(arch_schema_def);

        var link_schema_def = {
            name:'string',
            scope:'string',
            title:'string'
        }

        var full_schema_def = _.extend({
            link_to:[link_schema_def],
            _id:{type:'string', unique:true}, // == scope + ':' + name
            name:{type:'string', index:true},
            versions:[arch_schema_def],
            deleted:{type:'boolean', default:false},
            scope:{type:'string', index:true},
            creator:{ type:mongoose_inject.Schema.Types.ObjectId, ref:'member' },
            scope_root:{type:'boolean', default:false},
            tags: ['string']
        }, arch_schema_def);

        var schema = new mongoose_inject.Schema(full_schema_def);
        schema.index({title:true, scope:true});
        schema.index({name:true, scope:true});

        _model = mm.create(
            schema,
            {
                name:"wiki_article",

                article_map:function (cb, scope) {
                    function _map(err, arts) {
                        cb(null, _.reduce(arts, function (map, art) {
                            if (!map[art.scope]){
                                map[art.scope] = {};
                            }

                            map[art.scope][art.name] = art.title
                            return map;
                        }, {}));
                    }

                    if (scope) {
                        _model.active().where('scope').equals(scope).select({name:1, scope:1}).exec(_map)
                    } else {
                        _model.active().select({name:1, scope:1, title: 1}).exec(_map)
                    }
                },

                links_to: function(scope, name, cb){

                  _model.find({'link_to.name': name, 'link_to.scope': scope, deleted: false}).select({
                      name: 1,
                      scope: 1,
                      title: 1
                  }).exec(cb);
                },

                orphan_links:function (cb) {
                    _model.active().select({link_to:1, name:1, scope:1, content:1}).exec(function (err, arts) {
                        var linked_arts = [];
                        var gate = Gate.create();

                        _.each(arts, function (art) {
                            var l = gate.latch();
                            _model.link(art, function(err, linked_art){
                                console.log('from link: %s, %s', util.inspect(err), util.inspect(linked_art));
                                linked_arts.push(linked_art);
                                l();
                            });
                        })
                        gate.await(function () {

                            var map_articles = _.map(linked_arts, function(a){
                                a = a.toJSON();
                                console.log('map articles item: %s', util.inspect(a));
                                delete a.content;
                                return a;
                            });

                            console.log('MAP ARTICLES: %s', util.inspect(map_articles));
                            cb(null, map_articles);
                        })
                    })
                },

                get_title:function (title, cb, scope) {
                    if (scope) {
                        this.find_one({title:title, scope:scope}, cb);
                    } else {
                        this.find_one({title:title}, cb);
                    }
                },

                text_links:function (text, cb) {
                    return wiki_links(text, cb);
                },

                promote_basis:function (article) {
                    if (article.scope_root) {
                        return 'wiki.' + article.scope;
                    } else {
                        return 'wiki.' + article.scope + '.' + article.name;
                    }
                },

                scope:function (scope, cb, full) {
                    var q = this.find_one({scope_root:true, scope:scope, deleted:false});
                    if (full) {
                        q.populate('versions.author');
                    } else {
                        q.select('-versions');
                    }
                    q.populate('author').populate('creator').exec(cb);
                },

                set_id:function (article) {
                    if (!(article.scope && (article.name || article.scope_root))) {
                        throw new Error('attempt to create id for article with missing name/scope: ' + util.inspect(article));
                    }
                    article._id = article.scope + (article.scope_root ? '' : (':' + article.name));
                    return article;
                },

                article:function (scope, name, cb, full) {
                    var q = this.find_one({scope:scope, name:name, deleted:false});
                    if (full) {
                        q.populate('versions.author');
                    } else {
                        q.select('-versions');
                    }
                    q.populate('author').populate('creator').exec(cb);
                },

                scopes:function (cb, full) {
                    var q = this.find({scope_root:true, deleted:false});
                    if (full) {
                        q.populate('versions.author');
                    } else {
                        q.select('-versions');
                    }
                    q.sort('name').populate('author').populate('creator').exec(cb);
                },

                articles_for_scope:function (scope, cb, full, inc_scope) {
                    var query = { scope:scope, deleted:false}
                    if (!inc_scope) {
                        query.scope_root = false;
                    }
                    var q = this.find(query);
                    if (full) {
                        q.populate('versions.author');
                    } else {
                        q.select('-versions');
                    }
                    q.sort('name').populate('author').populate('creator').exec(cb);
                },

                revise_article:function (article, new_data, author) {
                    this.preserve(article, new_data);
                    this.sign(article, author);
                    return article;
                },

                preserve:function (doc, new_data) { // call this method BEFORE you start saving updated data to the record
                    if (_DEBUG_SET){
                        console.log('************************ preserving doc %s with new data: %s', doc.name,  util.inspect(new_data));
                    }

                    if (!doc.versions) {
                        doc.versions = [];
                    }

                    var arch_data = {};

                    arch_fields.forEach(function (key) {
                        arch_data[key] = doc[key];
                    })

                    doc.versions.push(arch_data);
                    if (doc.markModified) {
                        doc.markModified('versions');
                    }

                    if (new_data) {
                        arch_fields.forEach(function (key) {
                            var value = new_data[key];
                            switch (key) {
                                case 'author':
                                    if (value._id) {
                                        value = value._id;
                                    }
                                    break;

                                case 'creator':

                                    if (value._id) {
                                        value = value._id;
                                    }
                                    break;
                            }
                            if (_DEBUG || _DEBUG_SET) console.log('wiki article: setting %s to %s', key, value);
                            doc[key] = value;
                        })
                    }
                    doc.write_date = new Date();

                    return doc;
                },

                sign:function (doc, author, date) {
                    if (author) {
                        if (_DEBUG) console.log('setting new scope author to ', author);
                        if (author._id) {
                            author = author._id;
                        }
                        doc.author = author;
                        if (!doc.creator) {
                            doc.creator = author;
                        }
                    }

                    doc.write_date = date ? date : new Date();
                    return doc;
                }

            }
            ,
            mongoose_inject
        );

        _model.link = require('model/wiki_article/link')(_model);
    }
    return _model;
}
