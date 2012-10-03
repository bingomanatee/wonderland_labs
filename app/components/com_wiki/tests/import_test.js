var tap = require('tap');
var util = require('util');
var _ = require('underscore');
var NE = require('nuby-express');
var path = require('path');
var _DEBUG = false;
var act = require('./../controllers/admin/actions/import/import_action');

tap.test('route to index', function (t) {

    var import_action = _.extend({
        on_output: function(rs, output){
          if (_DEBUG)  console.log('outputting %s', util.inspect(output));
            var files = _.sortBy(output.files, _.identity);
            t.deepEqual(files, ['other_wiki', 'test_export'], 'found files in test export dir')
            t.end();
        }
    }, act);

    import_action.EXPORT_ROOT = path.resolve(__dirname, 'test_export_files');
    import_action.models = {

        member:{
            can:function (rs, what, cb) {
                var can = true;

                if (_.isString(what)) {
                    what = [what];
                }

                what.forEach(function (test) {
                    switch (test) {
                        case 'create article':
                            can = true;
                            break;

                        default:
                            return cb(new Error('unknown test: ' + test), false);
                    }
                })

                cb(null, can);
            }
        }

    }

    var rs = new NE.Req_State_Mock({}, {});

    import_action.on_validate(rs);

})


tap.test('full import', function (t) {

    var import_action = _.extend({
        on_output: function(rs, output){
            if (_DEBUG)  console.log('outputting %s', util.inspect(output));
            var files = _.sortBy(output.files, _.identity);
            t.deepEqual(files, ['other_wiki', 'test_export'], 'found files in test export dir')
            t.equals(found_files, 3, 'three files found');
            t.end();
        }
    }, act);

    import_action.EXPORT_ROOT = path.resolve(__dirname, 'test_export_files');
    import_action.models = {

        member:{
            can:function (rs, what, cb) {
                var can = true;

                if (_.isString(what)) {
                    what = [what];
                }

                what.forEach(function (test) {
                    switch (test) {
                        case 'create article':
                            can = true;
                            break;

                        default:
                            return cb(new Error('unknown test: ' + test), false);
                    }
                })

                cb(null, can);
            }
        }

    }

    var found_files = 0;
    import_action.import_file = function(file_path){
        var tx = import_action.EXPORT_ROOT + '/(bar|foo|vey).json';
        console.log('regex: %s', tx);
        var file_test = new RegExp(t);

        t.ok(file_test.test(file_path), 'file path match: ' + file_path);

        ++found_files;
    }

    var rs = new NE.Req_State_Mock(import_action, {req_props: {scope: 'test_export'}});

    import_action.on_validate(rs);

    setTimeout(function(){
        console.log('go places: %s', util.inspect(rs.go_places));
        console.log('msgs: %s', util.inspect(rs.flash_msgs));
    }, 1000);

})
