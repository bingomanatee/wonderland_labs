var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var paj_encrypt = require('paj_encrypt');
var _DEBUG = false;

/* *************** MODULE ********* */

module.exports = {

    /**
     * note - this finds member from typical sign in fields - it doesn't
     * actually affect session.
     *
     * @param cb: function - where member goes
     * @param name can be member_name OR email
     * @param pass
     */
    sign_in:function (cb, name, pass) {
        var self = this;
        if (pass) {
            if (name) {
                self.find_one({"$or":[
                    {member_name:name},
                    {email:name}
                ]}, function (err, member) {
                    if (err) {
                        cb(err)
                    } else if (member) {
                  if (_DEBUG)      console.log('member to test: %s', util.inspect(member));
                        try {
                            var ep = self.encrypt_password(pass, member.enc_method, member.enc_envelope);
                            if (ep == member.pass) {
                                cb(null, member);
                            } else {
                                cb(new Error('bad pasword for ' + member.member_name));
                            }
                        } catch (err) {
                            cb(err)
                        }

                    } else {
                        cb(new Error("cannot find member " + name));
                    }
                })

            } else {
                cb(new Error('No name provided'));
            }
        } else {
            cb(new Error('No password provided'));
        }
    },

    set_member_pass:function (cb, member, pass, method, envelope) {
        var self = this;
        if (!envelope){
            envelope = self.make_envelope();
        }
        if (!method){
            method = 'md5';
        }
       // console.log('set_member_pass(%s,%s,%s,%s,%s)', cb,member, pass, method, envelope);
        if (!method){
            throw new Error('no method!!!!!!')
        }
        member.enc_method = method;
        member.enc_envelope = envelope;
        member.save(function (err, new_member) {
            if (err) {
                member.enc_method = '';
                member.enc_envelope = '';
                member.save(function (e) {
                    if(e){
                        console.log('cannot set member pass: %s: ---- %s',util.inspect(member), util.inspect(e))
                        cb(e);
                    } else {
                        console.log('cannot set member pass: %s: ---- %s',util.inspect(member), util.inspect(err))
                        cb(err);
                    }
                })
            } else {
                member.pass = self.encrypt_password(pass, method, envelope);
                member.save(cb);
            }
        })
    },

    encrypt_password:function (pass, method, envelope) {
        var self = this;
        if (!method){
            throw new Error('encrypt_password: no method!!!!!!')
        }
        console.log('encrypt password(%s,%s,%s)', pass, method, envelope);
        switch (method) {
            case 'md5':
                var e_pass = envelope.replace('*', pass);
                if (e_pass == envelope) {
                    throw new Error('bad envelope ' + envelope);
                }


                break;
            case 'sha1':
                var e_pass = envelope.replace('*', pass);
                if (e_pass == envelope) {
                    throw new Error('bad envelope ' + envelope);
                }


                break;
            case 'sha256':
                var e_pass = envelope.replace('*', pass);
                if (e_pass == envelope) {
                    throw new Error('bad envelope ' + envelope);
                }


                break;
            case 'ripemd160':
                var e_pass = envelope.replace('*', pass);
                if (e_pass == envelope) {
                    throw new Error('bad envelope ' + envelope);
                }


                break;

            default:
                throw new Error('cannot find method ' + method);
        }

        return paj_encrypt[method].any(e_pass, 'utf8');
    },

    make_envelope:function () {
        return Math.random() + "*" + Math.random()
    }

}