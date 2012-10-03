angular.module('scopes', ['scopesServices']);

angular.module('scopesServices', ['ngResource']).factory('Scopes',
    function ($resource) {
        return $resource('/wiki/article_rest/:scope/:article', {scope:"@scope", article:"@name"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    });

function ScopesCtrl($scope, $filter, $compile, Scopes) {

    /* *************** MODEL ************************** */

    var _def_summary = 'New scope summary...';
    var _def_content = "New scope content...\n <scope_menu></scope_menu>";

    $scope.edit_article = Scopes.get({article:article.name, scope:article.scope},

        function (article) {
            console.log('loading article ', article);
            _original_article = _.clone(article);
        }
    );

    /* *************** TRACKING CHANGES *************** *


     $scope.$watch('edit_article', function (article) {
     if (article) {
     console.log('watching article: ', article);
     _original_article = _.clone(article);
     }
     });
     */
    var _original_article = null;

    $scope.article_json = function(){
        return JSON.stringify($scope.edit_article);
    }

    $scope.update_article = function () {
        $scope.edit_article.promoted = $scope.promoted;
        console.log('updating article...', $scope.edit_article);
        Scopes.update($scope.edit_article, function (art) {
            console.log('update article result: ', art);
            if (art.error) {
                alert('error saving article: ' + art.error);
            } else {
                if (art.scope_root) {
                    var dest = "/wiki/s/" + art.name + '?flash_info=' + encodeURI('Updated site root article');
                } else {
                    var dest = "/wiki/a/" + art.scope + '/' + art.name + '?flash_info=' + encodeURI('Updated article');
                }
                console.log('dest: ' + dest);
                document.location = dest;
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

    if (promoted && promoted.limit_from_date) {
        promoted.limit_from_date = jQuery.format.date(promoted.limit_from_date, jQuery.format.date.defaultShortDateFormat)
    }

    if (promoted && promoted.limit_to_date) {
        promoted.limit_to_date = jQuery.format.date(promoted.limit_to_date, jQuery.format.date.defaultShortDateFormat)
    }

    $scope.promote = promoted ? true : false;
    $scope.promoted = promoted ? _.defaults(promoted, _prom_def) : _prom_def;


    /* ********************* HISTORY ********************** */

    $scope.main_span = "span12"
    $scope.history = false;
    $scope.versions = [];

    $scope.show_history = function () {
        $scope.history = !$scope.history;
        $scope.main_span = $scope.history ? 'span8' : 'span12';

        function _on_article_history(ah) {
            var versions = ah.versions ? ah.versions : [];
            delete ah.versions;
            versions.push(ah);
            console.log('versions: ', versions);
            _.forEach(versions, function (v) {
                v.write_date = _date_format(v.write_date);
                $scope.versions.push(v);
            })
            $scope.$digest();
        }

        if ($scope.history) {
            if (!$scope.versions.length) {
                if ($scope.edit_article.scope_root) {
                    $.get('/wiki/article_history/' + $scope.edit_article.name, _on_article_history);
                } else {
                    $.get('/wiki/article_history/' + $scope.edit_article.scope + '/' + $scope.edit_article.name, _on_article_history);
                }
            }
        }
    }

    /* ********************* HELPERS ********************** */

    function _set_can_submit() {
        $scope.can_submit = (
            (!$scope.summary_error) &&
                (!$scope.content_error) &&
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
        console.log('_date_format', d);

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

    /* **************** TITLE ************************** */

    $scope.title_error = '';
    $scope.title_row_class = 'control-group';

    var _title_regex = /[^\s]{3,}/i

    $scope.$watch('edit_article.title', function (title) {
        if (!title) return;
        console.log('title: ', title, _original_article);

        $scope.title_error = 'The scope title is required.' +
            ' It will be shown on the page - all characters allowed. It should be at least 3 characters long.';
        $scope.title_row_class = 'control-group error';
        if (_title_regex.test(title)) {
            $scope.title_error = '';
            if (_original_article && (_original_article.title != title)) {
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

    $scope.$watch('edit_article.summary', function (summary) {
        if (!summary) return;
        $scope.summary_error = 'The summary will be shown on lists, search results,' +
            ' hover overs, etc. It should be 5-500 characters';
        $scope.summary_row_class = 'control-group error';
        if ((summary.length > 5) && (summary.length < 500)) {
            $scope.summary_error = '';
            if (_original_article && (_original_article.summary != summary)) {
                $scope.summary_row_class = 'control-group success';
            } else {
                $scope.summary_row_class = 'control-group';
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

    $scope.$watch('edit_article.content', function (content) {
        if (!content) return;
        $scope.content_error = 'The content will be shown on page visits. ' +
            'It should be at least 5 characters.';
        $scope.content_row_class = 'control-group error';
        if ((content.length > 5)) {
            $scope.content_error = '';
            if (_original_article && (_original_article.content != content)) {
                $scope.content_row_class = 'control-group success';
            } else {
                $scope.content_row_class = 'control-group';
            }
        }
        var h = wiki(content, function (err, h) {
            if (err) {
                return // console.log('error in wiki: ', err);
            } else {
                // console.log('setting content to ', h);
                $('#content_md').html(h);
            }
        });

        _set_can_submit();
    });

}

ScopesCtrl.$inject = ['$scope', '$filter', '$compile', 'Scopes'];


