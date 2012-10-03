angular.module('scopes', ['scopesServices']);

angular.module('scopesServices', ['ngResource']).factory('Scopes',
    function ($resource) {
        return $resource('/admin/wiki/scope_rest', {}, {
            add:{method:'POST' }
        });
    });

function ScopesCtrl($scope, Scopes) {
    var _DEBUG = false;
    var _def_summary = 'New scope summary...';
    var _def_content_text = 'New scope content';
    var _def_content = _def_content_text + "...\n <scope_menu></scope_menu>";
    var _def_title = 'New Scope';

    /* *************** MODEL ************************** */

    $scope.new_scope = {
        name:'new_scope',
        title:_def_title,
        summary:_def_summary,
        scope_root: true,
        content:_def_content};

    /* *************** TRACKING CHANGES *************** */

    var _original_article = null;

    $scope.create_scope = function () {
        $scope.new_scope.promoted = $scope.promoted;
        if (_DEBUG) console.log('creating...', $scope.new_scope);
        $scope.new_scope.scope = $scope.new_scope.name;
        Scopes.add( $scope.new_scope, function (art) {
            if (_DEBUG) console.log('update article result: ', art);
            if (art.error) {
                alert('error saving article: ' + art.error);
            } else {
                document.location = '/admin/wiki/scopes';
            }
        });
    }

    /* ********************* PROMOTED ********************* */

    var _prom_def = {
        limit_from:false,
        limit_from_date:$.format.date(new Date(), jQuery.format.date.defaultShortDateFormat),
        limit_to:false,
        limit_to_date:$.format.date(new Date(new Date().getFullYear() + 1,
            new Date().getMonth(),
            new Date().getDate()
        ), jQuery.format.date.defaultShortDateFormat)
    };

    $scope.promote = false;
    $scope.promoted = _prom_def;

    /* ********************* HELPERS ********************** */

    function _set_can_submit() {
        $scope.can_submit = (
            (!$scope.summary_error) &&
                (!$scope.content_error) &&
                (!$scope.name_error) &&
                (!$scope.title_error)
            );
    }

    var df_template = _.template('<%= mn %> <%= day %><% if(year == new Date().getFullYear()){ %><% if (month == new Date().getMonth() + 1){ %>, <%= hour %>:<%= minute %><% } %><% } else { %>, <%= year %><% } %>');
    var _unix_date_regex = /(.*)-(.*)-(.*)T(.*):(.*):(.*)/;
    var _mns = ',Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(',');

    function _date_format(d) {
        if (!d) {
            return '';
        }
        if (_DEBUG) console.log('_date_format', d);

        if (_unix_date_regex.test(d)) {
            var dv = _unix_date_regex.exec(d);
            dv.shift();
            var keys = ['year', 'month', 'day', 'hour', 'minute'];

            var dd = _.reduce(dv, function (dd, value) {
                if (keys.length) dd[keys.shift()] = value;
                return dd;
            }, {});

            dd.day = dd.day.replace(/^0/,'');
            dd.month = dd.month.replace(/^0/, '');

            dd.mn = _mns[parseInt(dd.month)];
        } else {
            var dd = {};
            var date_parts = d.split(' ');
            dd.time = date_parts[4].split(':');
            dd.year = date_parts[3];
            dd.day = date_parts[2];

            dd.hour = time[0];
            dd.minute = time[1];
            dd.month = _.indexOf(_mns, dd.mn);
        }

        return df_template(dd);
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

    var _title_regex = /[^\s]{3,}/i;
    var _original_title_regex = new RegExp(_def_title, 'i');

    $scope.$watch('new_scope.title', function (title) {
        if (!title) return;
        if (_DEBUG) console.log('title: ', title, _original_article);

        $scope.title_error = 'The scope title is required.' +
            ' It will be shown on the page - all characters allowed. It should be at least 3 characters long.';
        $scope.title_row_class = 'control-group error';
        if (_title_regex.test(title)) {
            if (!_original_title_regex.test(title)) {
                $scope.title_error = '';
                $scope.title_row_class = 'control-group success';
            } else {
                $scope.title_row_class = 'control-group';
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
        if (!summary) return;
        $scope.summary_error = 'The summary will be shown on lists, search results,' +
            ' hover overs, etc. It should be 5-500 characters';
        $scope.summary_row_class = 'control-group error';
        if ((summary.length > 5) && (summary.length < 500)) {
            if (_summary_ph_regex.test(summary)) {
                $scope.summary_row_class = 'control-group';
            } else {
                $scope.summary_row_class = 'control-group success';
                $scope.summary_error = '';
            }
        }
        wiki(summary, function (err, h) {
            if (err) {
                return // console.log('error in wiki: ', err);
            } else {
                // console.log('setting summary to ', h);
                $('#summary_md').html(h);
            }
        });
        _set_can_submit();
    });

    /* **************** CONTENT ************************** */

    $scope.content_error = '';
    $scope.content_row_class = 'control-group';
    $scope.content_md = '';

    var _def_content_text_regex = new RegExp(_def_content_text, 'i');
    var _scope_menu_regex = /<scope_menu>([^<]*)<\/scope_menu>/;
    
    $scope.$watch('new_scope.content', function (content) {
        if (!content) return;
        $scope.content_error = 'The content will be shown on page visits. ' +
            'It should be at least 5 characters.';
        $scope.content_row_class = 'control-group error';
        if ((content.length > 5) && _scope_menu_regex.test(content)) {
            _update_scope_menu();
            if (_def_content_text_regex.test(content)) {
                $scope.content_row_class = 'control-group';
            } else {
                $scope.content_error = '';
                $scope.content_row_class = 'control-group success';
            }
        }

         wiki(content, function (err, h) {
            if (err) {
                return // console.log('error in wiki: ', err);
            } else {
                // console.log('setting content to ', h);
            }
            $('#content_md').html(h);
        });

        _set_can_submit();
    });

}

ScopesCtrl.$inject = ['$scope', 'Scopes'];


