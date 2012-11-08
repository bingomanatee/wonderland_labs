var path = require('path');
var fs = require('fs');
var wrench = require('wrench');

var EXPORT_ROOT = path.resolve(__dirname, '../../../../exports');
console.log('slide export: %s', EXPORT_ROOT);

module.exports = {

    model: function(){
        return this.models.slideshow;
    },

    on_validate: function(rs){
        var self = this;
        this.on_input(rs, rs.req_props.id);
    },

    on_input: function(rs, id){
        var self = this;
        this.model().get(id, function(err, slideshow){
            self.model.slides(slideshow, function(err, slides){
                var old_path = path.resolve(EXPORT_ROOT, '/' + slideshow._id);
                wrench.rmdirRecursive(old_path, function(){
                    console.log('%s removed', old_path);
                    fs.mkdir(old_path, function(){

                        slides.forEach(function(slide){

                            var dest = path.resolve(EXPORT_ROOT, '/' + slide._id + '.json');
                            fs.writeFile(dest, JSON.stringify(slide.toJSON()));

                        })

                        rs.send({_id: id, 'result': 'exported slides'});

                    });
                })

            })
        })
    }
}