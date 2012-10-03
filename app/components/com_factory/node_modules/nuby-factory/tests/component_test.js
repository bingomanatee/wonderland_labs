var tap = require('tap');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var wrench = require('wrench');
var util = require('util');

var nuby_factory = require('./../index');
var COM_NAME = 'com_maker';

var COM_DIR = __dirname + '/com_test/' + COM_NAME;
var COM_CONFIG_PATH = COM_DIR + '/' + COM_NAME + '_config.json';

var COM_2_NAME = 'com_foo';
var COM_2_DIR = COM_DIR + '/components/' + COM_2_NAME;

var CON_NAME = 'bar';
var CON_DIR = COM_DIR + '/controllers/' + CON_NAME;
var CON_CONFIG_PATH = CON_DIR + '/' + CON_NAME + '_config.json';

var ACT_1_NAME = 'bob';
var ACT_2_NAME = 'ray';
var ACT_1_DIR = CON_DIR + '/actions/' + ACT_1_NAME;
var ACT_1_CONFIG_PATH = ACT_1_DIR + '/' + ACT_1_NAME + '_config.json';
var ACT_1_ACTION_PATH = ACT_1_DIR + '/' + ACT_1_NAME + '_action.js';

function _clear_dirs() {
    if (fs.existsSync(COM_DIR)) {
        try {
            var out = wrench.rmdirSyncRecursive(COM_DIR);
        } catch (err) {
            console.log('cannot reset %s: %s', COM_DIR, err.message);
            throw err;
        }
        if (fs.existsSync(COM_DIR)) {
            throw new Error('cannot delete ' + COM_DIR);
        }
    }
}

tap.test('creating components, com directories, com configs', function (t) {

    _clear_dirs();

    var com = new nuby_factory.Component({file_path:path.dirname(COM_DIR), config:{foo:1, bar:2}, name:COM_NAME});
    var bar = new nuby_factory.Controller({name:CON_NAME, config:{foo:3, bar:4}}, com)
    var com2 = new nuby_factory.Component({name:COM_2_NAME}, com);
    var act_bob = new nuby_factory.Action({name:ACT_1_NAME, config:{foo:5, bar:6}}, bar);
    var act_ray = new nuby_factory.Action({
        name:ACT_2_NAME,
        validate:{ on:true, get:true, put:true, post:true, delete:true},
        input:{on:true, get:true, put:true, post:true, delete:true},
        process:{on:true, get:true, put:true, post:true, delete:true}
    }, bar);

    com.render(function () {

        /* ************* PATH CALCULATION ************* */

        // --- test 1
        t.equal(com.get_path(), COM_DIR, ' -- test A -- com.get_path() == ' + COM_DIR);
        t.equal(com2.get_path(), COM_2_DIR, '-- test B -- com2.get_path() == ' + COM_2_DIR);

        t.equal(com.config_path(), COM_CONFIG_PATH, ' -- test C -- com config file path == ' + COM_CONFIG_PATH);
        t.equal(act_bob.get_path(), ACT_1_DIR, '-- test D -- act bob dir == ' + ACT_1_DIR);

        t.equal(act_bob.config_path(), ACT_1_CONFIG_PATH, ' -- test D -- act bob config path == ' + ACT_1_CONFIG_PATH);
        t.equal(act_bob._action_path(), ACT_1_ACTION_PATH, ' -- test E -- act bob action path == ' + ACT_1_ACTION_PATH);

        t.equal(bar.get_path(), CON_DIR, ' -- test F -- con bar path = ' + CON_DIR);

        /* ************** PATH CREATION ************** */

        // test 6
        t.ok(fs.existsSync(COM_DIR), ' -- test G -- rendering a component creates ' + COM_DIR);
        var cce_exists = fs.existsSync(COM_CONFIG_PATH);
        t.ok(cce_exists, 'config file exists: ', +COM_CONFIG_PATH);

        t.ok(fs.existsSync(COM_DIR), ' -- test H -- rendering a component creates ' + COM_DIR);
        t.ok(fs.existsSync(COM_2_DIR), ' -- test I -- rendering component 2 creates ' + COM_2_DIR);

        t.ok(fs.existsSync(CON_DIR), ' -- test J -- rendering a controller creates ' + CON_DIR);

        var ccp_exists = fs.existsSync(CON_CONFIG_PATH);
        t.ok(ccp_exists, ' -- test K -- controller path exists');

        var a1cp_exists = fs.existsSync(ACT_1_CONFIG_PATH);
        t.ok(a1cp_exists, ' -- test L -- act 1 config path exists');

        /* ***************** CONFIG FILE CONTENT *********** */

        // test 11

        if (cce_exists){
            var com_config = fs.readFileSync(COM_CONFIG_PATH, 'utf8');
            t.equals(com_config, '{"foo":1,"bar":2}', ' -- test M -- com config content');
        }

        if (ccp_exists){
            var con_config = fs.readFileSync(CON_CONFIG_PATH, 'utf8');
            t.equals(con_config, '{"foo":3,"bar":4}', ' -- test N -- con config content');
        }

        if (a1cp_exists){
            var act_config = fs.readFileSync(ACT_1_CONFIG_PATH, 'utf8');
            t.equals(act_config, '{"foo":5,"bar":6}', ' -- test O -- act config content')
        }

        t.end()
    })

})