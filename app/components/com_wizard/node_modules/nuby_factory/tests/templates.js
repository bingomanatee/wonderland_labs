var tap = require('tap');
var fs = require('fs');
var ejs = require('ejs');

var VAL_TRUE_NO_METH = 'on_validate: function (rs){var self = this;this.on_input(rs);},';
var VAL_TRUE_GET = 'on_get_validate: function (rs){var self = this;this.on_input(rs);},';
var VAL_TRUE_POST = 'on_post_validate: function (rs){var self = this;this.on_input(rs);},';
var VAL_TRUE_PUT = 'on_put_validate: function (rs){var self = this;this.on_input(rs);},';
var VAL_TRUE_DELETE = 'on_delete_validate: function (rs){var self = this;this.on_input(rs);},';

var VAL_FOO_GET = 'on_get_validate: function (rs){foo},';
var INPUT_TRUE_NO_METH = 'on_input: function (rs){var self = this;self.on_process(rs,rs.req_props);},';
var PROC_TRUE_NO_METH = 'on_process: function (rs,input){foo},';

tap.test('_on_validate template', function(t){
    fs.readFile(__dirname + '/../templates/_on_validate.js', 'utf8', function(err, txt){
        var e = ejs.compile(txt);

        var out = e({on_validate: true, method: false});
        t.equals(out, VAL_TRUE_NO_METH, 'testing no method validate boolean');

        out = e({on_validate: 'foo', method: false});
        t.equals(out, 'on_validate: function (rs){foo},', 'testing no method string validate  content');

        out = e({method: false, on_validate: function(rs){var self = this;this.on_input(rs);}});
        t.equals(out, 'on_validate: function (rs){var self = this;this.on_input(rs);},', 'testing no method  validate function');

        var out = e({on_validate: true, method: 'get'});
        t.equals(out, VAL_TRUE_GET, 'testing get boolean  validate get');

        out = e({on_validate: 'foo', method: 'get'});
        t.equals(out, VAL_FOO_GET, 'testing get string validate  content');

        out = e({method: 'get', on_validate: function(rs){var self = this;this.on_input(rs);}});
        t.equals(out, 'on_get_validate: function (rs){var self = this;this.on_input(rs);},', 'testing get  validate function');

        t.end();
    })
})
tap.test('_on_input template', function(t){
    fs.readFile(__dirname + '/../templates/_on_input.js', 'utf8', function(err, txt){
        var e = ejs.compile(txt);

        var out = e({on_input: true, method: false});
        t.equals(out, INPUT_TRUE_NO_METH, 'testing no method input boolean');

        out = e({on_input: 'foo', method: false});
        t.equals(out, 'on_input: function (rs){foo},', 'testing string input content');

        out = e({method: false, on_input: function(rs){var self = this;self.on_process(rs);}});
        t.equals(out, 'on_input: function (rs){var self = this;self.on_process(rs);},', 'testing no method input function');

        var out = e({on_input: true, method: 'get'});
        t.equals(out, 'on_get_input: function (rs){var self = this;self.on_process(rs,rs.req_props);},', 'testing boolean input get');

        out = e({on_input: 'foo', method: 'get'});
        t.equals(out, 'on_get_input: function (rs){foo},', 'testing string get input content');

        out = e({method: 'get', on_input: function(rs){var self = this;self.on_process(rs);}});
        t.equals(out, 'on_get_input: function (rs){var self = this;self.on_process(rs);},', 'testing get input function');

        t.end();
    })
})

tap.test('_on_process template', function(t){
    fs.readFile(__dirname + '/../templates/_on_process.js', 'utf8', function(err, txt){
        var e = ejs.compile(txt);

        var out = e({on_process: true, method: false});
        t.equals(out, 'on_process: function (rs){var self = this;self.on_output(rs,input);},', 'testing no method process boolean');

        out = e({on_process: 'foo', method: false});
        t.equals(out, PROC_TRUE_NO_METH, 'testing string no method process content');

        out = e({method: false, on_process: function(rs){var self = this;self.on_output(rs);}});
        t.equals(out, 'on_process: function (rs){var self = this;self.on_output(rs);},', 'testing no method process function');

        var out = e({on_process: true, method: 'get'});
        t.equals(out, 'on_get_process: function (rs){var self = this;self.on_output(rs,input);},', 'testing get process boolean get');

        out = e({on_process: 'foo', method: 'get'});
        t.equals(out, 'on_get_process: function (rs,input){foo},', 'testing string get process content');

        out = e({method: 'get', on_process: function(rs){var self = this;self.on_output(rs);}});
        t.equals(out, 'on_get_process: function (rs){var self = this;self.on_output(rs);},', 'testing get process function');

        t.end();
    })
})

tap.test('action template', function(t){

    fs.readFile(__dirname + '/../templates/action.js', 'utf8', function(err, txt){
        var e = ejs.compile(txt);
        var out = e({validate: {on: false}, input: {}, process: {}, comment: false});
        t.equals(out, 'module.exports = {}', 'action template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true}, input: {}, process: {}, comment: false});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH + '}', 'action vt template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true, post: true}, input: {}, process: {}, comment: false});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH + VAL_TRUE_POST + '}', 'action vtvtp template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true, get: 'foo'}, input: {}, process: {}, comment: false});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH + VAL_FOO_GET + '}', 'action vtvf template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true, get: 'foo'}, input: {on: true }, process: {}, comment: false});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH +  INPUT_TRUE_NO_METH + VAL_FOO_GET +'}', 'action vtitvf template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true, get: 'foo'}, input: {on: true }, process: {on: 'foo'}, comment: false});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH +  INPUT_TRUE_NO_METH + PROC_TRUE_NO_METH + VAL_FOO_GET +'}', 'action vtitptvf template');

        var e = ejs.compile(txt);
        var out = e({validate: {on: true, post: true}, input: {}, process: {}, comment: true});
        t.equals(out, 'module.exports = {' + VAL_TRUE_NO_METH + "\n\n" + '/* ****** GET ****** */' + "\n\n\n\n" + '/* ****** POST ****** */' + "\n\n" + VAL_TRUE_POST  + "\n\n" +  '/* ****** PUT ****** */'  +  "\n\n\n\n" +'/* ****** DELETE ****** */' + "\n\n" + '}', 'action vtvtp template with comments');

        t.end();
    });

})