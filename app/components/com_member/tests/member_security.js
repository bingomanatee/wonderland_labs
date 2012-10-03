var tap = require('tap');
var util = require('util');
var NE = require('nuby-express');
var member_model = require('./../resources/models/member_model');
var con = 'mongodb://localhost/member_security_' + Math.floor(Math.random() * 100000 + .001);
console.log('creating %s', con);
NE.deps.mongoose.connect(con);
var tests_done = 0;
var TEST_COUNT = 1;

function _try_drop() {
    if (++tests_done >= TEST_COUNT) {
        NE.deps.mongoose.connection.db.executeDbCommand({dropDatabase:1}, function (err, result) {
            console.log(err);
            console.log(result);
            process.exit(0);
        });
    }
}

tap.test('', function (t) {

    var mm = member_model();

    mm.add({}, function (err, m) {
        t.ok(err, 'some validation errors fail: ' + util.inspect(err));

        mm.add({member_name:'Frodo'}, function (err, frodo) {

            t.ok(err === null, 'succeed with just a name: ' + util.inspect(err));

            mm.set_member_pass(function (e2, f2) {
                t.ok(e2 === null, 'set password');
                t.equals(f2.enc_method, 'md5', 'md5 is the enc method');

                mm.sign_in(function (e3, f3) {
                    if (e3) {
                        console.log(' SIGN IN ERROR ');
                        t.fail(e3);
                    } else {
                        t.ok(e3 === null, 'no error to sign in');
                        t.ok(f3, 'found frodo');
                        if (f3)   t.equals(f3._id.toString(), frodo._id.toString(), 'same frodo ID');
                    }


                    mm.sign_in(function (e3, f3) {
                        t.ok(e3, 'Cant sign in with bad pass');
                        _try_drop();
                        t.end();
                    }, 'Frodo', 'Sex Chat');
                }, 'Frodo', 'Car Talk');


            }, frodo, 'Car Talk', 'md5', 'NP*R');
        })
    })

})