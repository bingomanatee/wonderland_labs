angular.module('scopes', ['scopesServices']);

angular.module('scopesServices', ['ngResource']).factory('Scopes',
    function ($resource) {
        return $resource('/admin/wiki/scope_rest/:_id', {_id:"@_id"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    });

function ScopesCtrl($scope, $filter, $compile, Scopes) {

    console.log('Scopes: ', Scopes);

    /* *************** MODEL ************************** */

    var _def_summary = 'New scope summary...';
    var _def_content = "New scope content...\n <scope_menu></scope_menu>";

    $scope.new_scope = {name:'new_scope',
        title:'New Scope',
        summary:_def_summary,
        content:_def_content};

    $scope.save_scope = function () {
        Scopes.add($scope.new_scope);
        setTimeout(function () {
            document.location = "/admin/wiki/scopes?flash_info=" + encodeURI('Scope Created');
        }, 1000);
    }

    /* ********************* HELPERS ********************** */

    $scope.add_scope = function () {
        document.location = '/admin/wiki/add_scope';
    }

    function _set_can_submit() {
        $scope.can_submit = (
            (!$scope.summary_error) &&
                (!$scope.content_error) &&
                (!$scope.title_error) &&
                (!$scope.name_error)
            );
    }

    function _update_scope_menu() {
        var rep = '<scope_menu>' + $scope.new_scope.name + '</scope_menu>';
        if (_scope_menu_regex.test($scope.new_scope.content)) {
            $scope.new_scope.content = $scope.new_scope.content.replace(_scope_menu_regex, rep);
            console.log('_update_scope_menu set content to ', $scope.new_scope.content);
        } else {
            console.log('_update_scope_menu: no scope menu in content');
        }
    }

    /* **************** NAME ************************** */

    $scope.name_error = '';
    $scope.name_row_class = 'control-group';
    var _name_regex = /^[a-z][\w]{4,}$/i;

    $scope.$watch('new_scope.name', function (name) {
        //     console.log('name: ', name);

        $scope.name_error = 'The scope name is required. It will be used in the URL; no spaces or special characters';
        $scope.name_row_class = 'control-group error';
        if (_name_regex.test(name)) {
            if (/new_scope/i.test(name)) {
                $scope.name_row_class = 'control-group';
            } else {
                $scope.name_error = '';
                $scope.name_row_class = 'control-group success';
                _update_scope_menu();
            }
        }
        $scope.new_scope.name = name.toLowerCase().replace(/[\s]+/g, '_');
        _set_can_submit();
    });

    /* **************** TITLE ************************** */

    $scope.title_error = '';
    $scope.title_row_class = 'control-group';

    var _title_regex = /[^\s]{3,}/i

    $scope.$watch('new_scope.title', function (title) {
        //  console.log('title: ', title);

        $scope.title_error = 'The scope title is required.' +
            ' It will be shown on the page - all characters allowed';
        $scope.title_row_class = 'control-group error';
        if (_title_regex.test(title)) {
            if (/New Scope/i.test(title)) {
                $scope.title_row_class = 'control-group';
            } else {
                $scope.title_error = '';
                $scope.title_row_class = 'control-group success';
            }
        }
        _set_can_submit();
    });

    /* **************** SUMMARY ************************** */

    $scope.summary_error = '';
    $scope.summary_row_class = 'control-group';
    $scope.summary_md = '';

    var _summary_ph_regex = new RegExp(_def_summary, 'i');

    $scope.$watch('new_scope.summary', function (summary) {

        $scope.summary_error = 'The summary will be shown on lists, search results,' +
            ' hover overs, etc. It should be 5-500 characters';
        $scope.summary_row_class = 'control-group error';
        if ((summary.length > 5) && (summary.length < 500)) {
            if (_summary_ph_regex.test(summary)) {
                $scope.summary_row_class = 'control-group';
            } else {
                $scope.summary_error = '';
                $scope.summary_row_class = 'control-group success';
            }
        }
        wiki(summary, $scope.new_scope, function (err, h) {
            if (err) {
                return console.log('error in wiki: ', err);
            } else {
                console.log('setting summary to ', h);
            }
            $('#summary_md').html(h);
        });
        _set_can_submit();
    });

    /* **************** SUMMARY ************************** */

    $scope.content_error = '';
    $scope.content_row_class = 'control-group';
    $scope.content_md = '';

    var _content_ph_regex = new RegExp(_def_content, 'i');
    var _scope_menu_regex = /<scope_menu>([^<]*)<\/scope_menu>/;


    $scope.$watch('new_scope.content', function (content) {

        $scope.content_error = 'The content will be shown on page visits. ' +
            'It should be at least 5 characters and contain ' +
            'the <scope_menu></scope_menu> macro';
        $scope.content_row_class = 'control-group error';
        if ((content.length > 5) && _scope_menu_regex.test(content)) {
            if (_content_ph_regex.test(content)) {
                $scope.content_row_class = 'control-group';
                _update_scope_menu()
            } else {
                console.log('content test: ', _scope_menu_regex.test(content));
                $scope.content_error = '';
                $scope.content_row_class = 'control-group success';
            }
        }
        var h = wiki(content, new_scope, function (err, h) {
            if (err) {
                return console.log('error in wiki: ', err);
            } else {
                console.log('setting content to ', h);
            }
            $('#content_md').html(h);
        });

        _set_can_submit();
    });

}

ScopesCtrl.$inject = ['$scope', '$filter', '$compile', 'Scopes'];


