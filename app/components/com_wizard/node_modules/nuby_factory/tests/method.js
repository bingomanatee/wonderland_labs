var method = require('./../lib/method');
var tap = require('tap');

function foo() {
    bar;
}
var BASIC_FUNCTION = "function foo(){\n\tbar\n}";
var BASIC_FUNCTION2 = "function foo(a,b){\n\tbar\n}";
var BASIC_FUNCTION3 = "function foo(a,b){\n\t++a\n\t++b\n}";
var BASIC_FUNCTION_SC = "function foo(){\n\tbar\n}";
var BASIC_FUNCTION2_SC = "function foo(a,b){\n\tbar\n}";
var BASIC_FUNCTION3_SC = "function foo(a,b){\n\t++a\n\t++b\n}";

var INPUT_FUNCTION = 'function on_input(rs){\n\tvar self = this;\n\tvar input = rs.req_props;\n\tself.on_process(rs, input)\n}'

tap.test('basic Function_Def', function (t) {

    var fd = new method.Function_Def('foo', 'bar');
    fd.semicolons = false;
    t.equals(fd.toString(), BASIC_FUNCTION, 'basic function');
    fd.semicolons = false;

    var fd2 = new method.Function_Def('foo', 'bar', ['a','b']);
    fd2.semicolons = false;
    t.equals(fd2.toString(), BASIC_FUNCTION2, 'basic function');

    var fd3 = new method.Function_Def('foo', ['++a', '++b'], ['a','b']);
    fd3.semicolons = false;
    t.equals(fd3.toString(), BASIC_FUNCTION3, 'basic function');

    t.end();
})

tap.test('methods', function(t){
    var im = new method.on_input();
    t.equals(im.toString(), INPUT_FUNCTION, 'basic input method');

    t.end();
})