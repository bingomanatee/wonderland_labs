angular.module('articles', ['articlesServices']);

angular.module('articlesServices', ['ngResource']).factory('Articles',
    function ($resource) {
        return $resource('/wiki/article_rest/:scope/:name', {scope: "@scope", name: "@name"}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    });

function ArticleCtrl($scope, $filter, $compile, Articles) {

//    console.log('Articles: ', Articles);

    /* *************** MODEL ************************** */

    var _def_summary = 'New summary...';
    var _def_content = "New content...";

    $scope.new_article = {name:article.name,
        title:article.name.replace(/_/i, ' '),
        scope:article.scope,
        summary:_def_summary,
        content:_def_content};

    $scope.add_article = function () {
        Articles.add($scope.new_article, function () {
            document.location = "/wiki/a/" + $scope.new_article.scope + '/' + $scope.new_article.name + '/?flash_info=' + encodeURI('Article Created');
        });
    }

    /* ********************* HELPERS ********************** */

    function _set_can_submit() {
        $scope.can_submit = (
            (!$scope.summary_error) &&
                (!$scope.content_error) &&
                (!$scope.title_error) &&
                (!$scope.name_error)
            );
    }

    /* **************** TITLE ************************** */

    $scope.title_error = '';
    $scope.title_row_class = 'control-group';

    var _title_regex = /[^\s]{3,}/i

    $scope.$watch('new_article.title', function (title) {
        //  console.log('title: ', title);

        $scope.title_error = 'The article title is required.' +
            ' It will be shown on the page - all characters allowed';
        $scope.title_row_class = 'control-group error';
        if (_title_regex.test(title)) {
            $scope.title_error = '';
            $scope.title_row_class = 'control-group success';
        }
        _set_can_submit();
    });

    /* **************** SUMMARY ************************** */

    $scope.summary_error = '';
    $scope.summary_row_class = 'control-group';
    $scope.summary_md = '';

    var _summary_ph_regex = new RegExp(_def_summary, 'i');

    $scope.$watch('new_article.summary', function (summary) {

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
        wiki(summary, $scope.new_article, function (err, h) {
            if (err) {
                return console.log('error in wiki: ', err);
            } else {
                console.log('setting summary to ', h);
            }
            $('#summary_md').html(h);
        });
        _set_can_submit();
    });

    /* **************** CONTENT ************************** */

    $scope.content_error = '';
    $scope.content_row_class = 'control-group';
    $scope.content_md = '';

    var _content_ph_regex = new RegExp(_def_content, 'i');

    $scope.$watch('new_article.content', function (content) {

        $scope.content_error = 'The content will be shown on page visits. ' +
            'It should be at least 5 characters and contain ' +
            'the <scope_menu></scope_menu> macro';
        $scope.content_row_class = 'control-group error';
        if ((content.length > 5)) {
            $scope.content_error = '';
            $scope.content_row_class = 'control-group success';
        }
        var h = wiki(content, $scope.new_article, function (err, h) {
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

ArticleCtrl.$inject = ['$scope', '$filter', '$compile', 'Articles'];


