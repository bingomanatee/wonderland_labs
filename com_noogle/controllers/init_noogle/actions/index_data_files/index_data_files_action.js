var elastic = require('elastic');

module.exports = {

    /* ****** GET ****** */

    on_get_validate:function (rs) {
        var self = this;

        var moved_on = false;

        elastic.define_index(function (err, content) {
            if (err){
                return self.emit('validate_error', rs, err);
            }
            console.log('done define index: %s %s', content,  err ? err.message  :'');
            if (!moved_on) {
                moved_on = true;
                self.on_get_input(rs);
            }
        })
        setTimeout(function () {
            if (!moved_on) {
                moved_on = true;
                self.on_get_input(rs);
            }
        }, 10000)

    },

    on_get_input:function (rs) {
        var self = this;
        this.models.noogle_file.active().sort('domain, file-').exec(function(err, files){
            self.on_get_process(rs, {files: files});
        })
    },

    on_get_process:function (rs, input) {
        var self = this;
        self.on_output(rs, input)
    },

    /* ****** POST ****** */

    on_post_validate:function (rs) {
        var self = this;
        self.on_post_input(rs)
    },

    on_post_input:function (rs) {
        var self = this;
        self.on_post_process(rs, rs.has_content("prev"), rs.has_content("next"));
    },

    on_post_process:function (rs, prev, next) {
        var self = this;
        console.log('stat set')
        if (next) {
            rs.go("/init_noogle/scan_data_files");
        } else if (prev) {
            rs.go("/init_noogle/intro");
        } else {
            rs.go("/init_noogle/scan_data_files");
        }

    },

    /* ****** PUT ****** */

    /* ****** DELETE ****** */

    a:'a' // last comma
}