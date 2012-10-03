MEMBER_SEARCH = {
    refresh:function () {
        var fbn = $('#member_search_form input[name="find_by_name"]');
        var fbr = $('#member_search_form input[name=find_by_role]');
        var fbt = $('#member_search_form input[name=find_by_task]');

        if (fbn.attr('checked')) {
            $('#name_to_find').show();
        } else {
            $('#name_to_find').hide();
        }

        if (fbr.attr('checked')) {
            $('#roles_to_find').show();
        } else {
            $('#roles_to_find').hide();
        }

        if (fbt.attr('checked')) {
            $('#tasks_to_find').show();
        } else {
            $('#tasks_to_find').hide();
        }
    }
}

$(function () {
    $('#member_search_form').submit(function () {
        var form_vals = _.reduce($('#member_search_form').serializeArray(), function (m, f) {
            if (m[f.name]) {
                m[f.name].push(f.value);
            } else {
                m[f.name] = [f.value];
            }
            return m;
        }, {});


        function _has_value(n){
            return form_vals[n] && form_vals[n].length;
        }

        var props = {
            find_by_task:_has_value('find_by_task'),
            find_by_name:_has_value('find_by_name'),
            find_by_role:_has_value('find_by_role'),
            name:form_vals.name[0],
            tasks:form_vals.tasks,
            roles:form_vals.roles};
        $('#members_list').load('/admin/members', props);
        return false;
    })
})
