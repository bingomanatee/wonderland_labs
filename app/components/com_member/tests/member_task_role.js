var tap = require('tap');
var util = require('util');
var NE = require('nuby-express');
var member_role_model_factory = require('./../resources/models/member_role_model');
var member_task_model_factory = require('./../resources/models/member_task_model');
var member_model_factory = require('./../resources/models/member_model');

var _ = require('underscore');

var con = 'mongodb://localhost/member_security_' + Math.floor(Math.random() * 100000 + .001);
console.log('creating %s', con);
NE.deps.mongoose.connect(con);
var tests_done = 0;
var TEST_COUNT = 1;

function _s(item){
    return _.sortBy(item, _.identity);
}

function _drop() {
    NE.deps.mongoose.connection.db.executeDbCommand({dropDatabase:1}, function (err, result) {
        console.log(err);
        console.log(result);
        process.exit(0);
    });
}

tap.test('', function (t) {

    var task_model = member_task_model_factory();
    var role_model = member_role_model_factory();
    var member_model = member_model_factory();

    task_model.add([
        {name:'alpha'},
        {name:'beta'},
        {name:'gamma'},
        {name:'delta'},
        {name: 'omega'}
    ], function(){

        role_model.add([{name: 'ab', tasks: ['alpha', 'beta']},
            {name: 'gd', tasks: ['gamma', 'delta']},
            {name: 'bg', tasks: ['beta', 'delta']},
            {name: 'admin', tasks: ['alpha','beta','gamma', 'delta', 'omega']}
        ], function(){

            role_model.roles_tasks(['bg', 'gd'], function(err, tasks){
                console.log('ab gd tasks: %s', util.inspect(tasks));

                t.ok(!_.include(tasks, 'alpha'), 'ab gd doesn\'t have alpha');
                t.ok(_.include(tasks, 'beta'), 'ab gd has beta');
                t.ok(_.include(tasks, 'gamma'), 'ab gd has gamma');
                t.ok(_.include(tasks, 'delta'), 'ab gd has delta');
                t.ok(!_.include(tasks, 'omega'), 'ab gd doesn\'t have omega');

                role_model.define_role(function(err, foo){
                 //   console.log('role foo: %s', util.inspect(foo.toJSON()));
                    var fro = _.sortBy(foo.tasks, _.identity);
                    var all_roles = _.sortBy(['alpha','beta','gamma', 'delta', 'omega'], _.identity);
                    t.deepEqual(fro, all_roles, 'foo has all roles');



                    member_model.put({member_name: 'test_member',
                    roles: ['foo', 'ab']
                    }, function(err, m){
                        t.deepEqual(_s(m.roles), _s(['foo', 'ab']), 'member has roles I have assigned');

                        member_model.remove_role('ab', function(){
                            /**
                             *   note - we are not even caring at this point whether the
                             *   named role was truly removed - only if its been removed from members' roster.
                             *   In fact remove_role does not CARE about the state of the member_role collection.
                             */
                            setTimeout(function(){
                                member_model.get_member_name('test_member', function(err, member){
                                    if (err){
                                        t.fail(err);

                                        _drop();
                                        t.end();
                                    } else {
                                        t.equals(member.member_name, 'test_member');
                                        t.equals(member.roles.indexOf('ab'), -1, 'no ab anymore');
                                        _drop();
                                        t.end();
                                    }

                                })}, 1000);

                        })

                    })

                }, 'foo', '*');
            })


        });

    })

})