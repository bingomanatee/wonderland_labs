REG = {
    _as_row_name:function (row_name) {

        if (/_row$/.test(row_name)) {
            return row_name;
        } else {
            return row_name + '_row';
        }
    },

    rate_pw:function (pass) {
        var pw = testPassword(pass);
        if (pw) {
            $('#pass_bar').css('width', (pw.intScore * (100 / 25)) + '%');

            var msg_class = 'error'
            var title = 'Weak Password';
            if (pw.intScore < 7) {
            } else if (pw.intScore < 18) {
                var msg_class = 'alert'
                var title = 'Fair Password';
            } else {
                var msg_class = 'success'
                var title = 'Excellent Password';
            }
            REG._add_alert('pass_rating_desc', '<b>' + title + ':</b> -- ' + pw.log, msg_class);
        }
    },

    field_name:function (n) {
        return /^member\[(.*)\]$/.exec(n)[1];
    },

    val:function () {
        console.log('validating');
        var form_vals = _.reduce($('form.wizard').serializeArray(), function (m, f) {
            m[REG.field_name(f.name)] = f.value;
            return m;
        }, {})

        console.log('validating form - fields = ', form_vals);
        REG._rem_alert('pass');
        REG._rem_alert('pass2');
        REG._rem_alert('member_name');
        //$('#submit_reg').hide();
        if (form_vals.member_name) {
            if (REG.mn_to) {
                clearTimeout(REG.mn_to);
            }
            REG.mn_to = setTimeout(function () {
                $.post('/member/name', form_vals, function (data) {
                    if (data.found) {
                        REG._add_alert('member_name',
                            'We already have a ' + form_vals.member_name + '. <a href=="/sign_in">Sign In</a>');
                     //   $('#submit_reg').hide();
                    } else {
                        REG._rem_alert('member_name')
                    }
                });
            }, 900);
            if (form_vals.pass) {
                REG.rate_pw(form_vals.pass);
                if (form_vals.pass2) {
                    if (!(form_vals.pass == form_vals.pass2)) {
                        REG._add_alert('pass', 'Paswords must match', 'error');
                        REG._add_alert('pass2', 'Paswords must match', 'error');
                    }
                } else {
                    REG._add_alert('pass2', 'Duplicate password is required', 'alert');
                }
            } else {
                REG._add_alert('pass', 'Password is required', 'alert');
            }
        } else {
            REG._add_alert('member_name', 'Member name is required', 'alert');
        }
    },

    _mc:function (mc) {
        if (mc) {
            if (/^alert-/.test(mc)) {
                return mc;
            } else {
                return 'alert-' + mc;
            }
        } else {
            return 'alert-error';
        }
    },

    _rem_alert:function (row_name) {
        var alert_sel = REG._alert_sel(row_name);
        console.log('removing alert from ', alert_sel);
        $(alert_sel).empty();
    },

    _alert_sel:function (row_name) {
        return  'form.wizard .' + REG._as_row_name(row_name) + ' .alert_ph';
    },

    _add_alert:function (row_name, msg, msg_class) {
        msg_class = (msg_class ? REG._mc(msg_class) : 'alert-error');
        var alert_sel = REG._alert_sel(row_name);
        console.log('adding alert to ', alert_sel);
        $(alert_sel).html('<div class="alert ' + msg_class + '">' +
            '<button type="button" class="close" data-dismiss="alert">×</button>  <span class="msg">' + msg + '</span></div>'
        )
    }

}