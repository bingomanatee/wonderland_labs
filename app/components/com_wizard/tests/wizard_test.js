var tap = require('tap');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var wrench = require('wrench');
var util = require('util');
var wizard = require('wizard_factory');

/* ****************** TEST PARAMETERS ******************* */

var WIZARD = {
    name:'wizard_foo',
    title:'Wizard Foo'
}

var STEPS = [
    {
        name:'alpha',
        bc_title:'al',
        title:'Alpha Bar',
        content:'alphabet soup',
        step:1
    },
    {
        name:'beta',
        bc_title:'be',
        title:'Beta Bar',
        content:'betamax',
        step:2
    },
    {
        name:'gamma',
        bc_title:'ga',
        title:'Gamma Bar',
        content:'Hulk Smash',
        step:3
    }

]

var WIZARD_TEST_DIR = __dirname + '/wizard_test'; // the name of the component directory to target
var WIZARD_TEST_CON_DIR = WIZARD_TEST_DIR + '/controllers/';
var CON_NAME = WIZARD.name;
var CON_DIR = WIZARD_TEST_CON_DIR + CON_NAME;
var VIEWS_FOLDER = CON_DIR + '/views';
var STEP_0_ACTION_PATH = CON_DIR + '/actions/' + STEPS[0].name;
var HEADER_TEMPLATE = VIEWS_FOLDER + '/step_header.html';
var FOOTER_TEMPLATE = VIEWS_FOLDER + '/step_footer.html';
var FIRST_HEADER = '<div class="header"><ul class="clearfix"><li class="current">al</li><li class="current">be</li><li class="current">ga</li></ul></div>'
var FIRST_FOOTER = '<div class="footer"><button class="next">Next<span>to &quot;Beta Bar&quot;</span></button></div>';
var STEP_0_CONTENT = [
    '<form method="post" class="wizard"><h1>Wizard Foo</h1>',
    '<%- partial("../../views/step_header.html", {step: "alpha"}) %> <br />',
    '<h2>Alpha Bar</h2>',
    '<p>alphabet soup</p>',
    '<%- partial("../../views/step_footer.html", {step: "alpha"}) %></form>'
].join("\n")

function _clear_dirs(target) {
    if (fs.existsSync(target)) {
        try {
            var out = wrench.rmdirSyncRecursive(target);
        } catch (err) {
            console.log('_clean_dirs cannot reset %s: %s', target, err.message);
            throw err;
        }
        if (fs.existsSync(target)) {
            throw new Error('cannot delete ' + target);
        }
    } else {
        throw new Error('_clean_dirs cannot remove non-existent dir ' + target)
    }
}

tap.test('base controller', function (t) {

    if (!fs.existsSync(WIZARD_TEST_DIR)) {
        t.fail('cannot run test - installation dir ' + WIZARD_TEST_DIR + ' missing');
        return t.end();
    }
    if (fs.existsSync(WIZARD_TEST_CON_DIR)) {
        _clear_dirs(WIZARD_TEST_CON_DIR);
    }

    var controller = wizard.make_controller(WIZARD, WIZARD_TEST_DIR);

    controller.render(function () {
        t.equal(controller.get_path(), CON_DIR, ' -- test A -- base controller path');
        t.end();
    });


})

tap.test('controller + views folder', function (t) {

    if (!fs.existsSync(WIZARD_TEST_DIR)) {
        t.fail('cannot run test - installation dir ' + WIZARD_TEST_DIR + ' missing');
        return t.end();
    }
    if (fs.existsSync(WIZARD_TEST_CON_DIR)) {
        _clear_dirs(WIZARD_TEST_CON_DIR);
    }

    var controller = wizard.make_controller(WIZARD, WIZARD_TEST_DIR);
    wizard.make_views_folder(controller);

    controller.render(function () {
        t.ok(fs.existsSync(VIEWS_FOLDER), ' -- test B -- views folder exists');
        t.end();
    });


})

tap.test('action_template_content', function (t) {

    if (!fs.existsSync(WIZARD_TEST_DIR)) {
        t.fail('cannot run test - installation dir ' + WIZARD_TEST_DIR + ' missing');
        return t.end();
    }
    if (fs.existsSync(WIZARD_TEST_CON_DIR)) {
        _clear_dirs(WIZARD_TEST_CON_DIR);
    }

    var controller = wizard.make_controller(WIZARD, WIZARD_TEST_DIR);
    wizard.make_views_folder(controller);

    var atc = wizard.action_template_content(WIZARD, STEPS[0]);
    t.equal(atc, STEP_0_CONTENT, ' -- test D -- testing action template content');

    var action = wizard.make_action(WIZARD, STEPS[0], controller);

    t.equals(action.get_path(), STEP_0_ACTION_PATH, ' -- test E -- Action - path')

    controller.render(function () {
        t.ok(fs.existsSync(action.get_path()), ' -- test F -- action folder exists');
        t.end();
    });


})

tap.test('view folder', function (t) {

    if (!fs.existsSync(WIZARD_TEST_DIR)) {
        t.fail('cannot run test - installation dir ' + WIZARD_TEST_DIR + ' missing');
        return t.end();
    }
    if (fs.existsSync(WIZARD_TEST_CON_DIR)) {
        _clear_dirs(WIZARD_TEST_CON_DIR);
    }

    var controller = wizard.make_controller(WIZARD, WIZARD_TEST_DIR);

    wizard.add_view_folder(controller, STEPS);

    controller.render(function () {
        t.equal(controller.get_path(), CON_DIR, ' -- test G -- controller with view folder');
        t.end();
    });


})

tap.test('whole make_wizard, templates', function (t) {

    wizard.make_wizard(WIZARD_TEST_DIR, WIZARD, STEPS, true, function () {

        var ht_exists = fs.existsSync(HEADER_TEMPLATE);
        t.ok(ht_exists, ' -- test G -- can find header')

        if (ht_exists) {
            var template = fs.readFileSync(HEADER_TEMPLATE, 'utf8');
            try {
                var compiled_header = ejs.compile(template);
            } catch (err) {
                console.log('--- template error: %s', err.message);
                return t.end();
            }

            var step_1_header = compiled_header({steps:STEPS, step:STEPS[0]});

            t.equals(step_1_header, FIRST_HEADER, ' -- test H -- First Header');

            var footer_template = fs.readFileSync(FOOTER_TEMPLATE, 'utf8');
            try {
                var compiled_footer = ejs.compile(footer_template);
            } catch (err) {
                console.log('--- template error: %s', err.message);
                return t.end();
            }

            var step_1_footer = compiled_footer({ step:STEPS[0].name});
            step_1_footer = step_1_footer.replace(/\n/g, '');

            t.equals(step_1_footer, FIRST_FOOTER, ' -- test I -- First Footer');


            t.end();
        } else {
            t.end();
        }
    })

})