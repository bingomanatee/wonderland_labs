angular.module('articles', ['articleservices']);

angular.module('articleservices', ['ngResource']).factory('Articles',
    function ($resource) {
        return $resource('/admin/wiki/article_rest/:scope/:name', {scope:'@scope', name:'@name'}, {
            get:{method:'GET'},
            query:{method:'GET', isArray:true},
            add:{method:'POST' },
            update:{method:'PUT' },
            delete:{method:'DELETE'}
        });
    }).filter('article_scope', function () {
        return function (article) {
            return article.scope_root ? '<b>' + article.scope + '</b>' : article.scope;
        };
    }).filter('article_name', function () {
        return function (article) {
            return article.scope_root ? '' : article.name;
        };
    }).filter('article_linked_from', function () {
        return function(article){
            var out = [];
            for(var i = 0; i < article.linked_from.length; ++i){
                out.push(article.linked_from.name);
            }
            return out.join('<br />');
        }
});

function ArticlesCtrl($scope, $filter, $compile, Articles) {

    /* *************** MODEL ************************** */

    $scope.articles = Articles.query();

    $scope.edit_article = function(art){
        if (art.scope_root){
            document.location= '/wiki/se/' + art.scope;
        } else {
            document.location= '/wiki/ae/' + art.scope + '/' + art.name;
        }
    }

    $scope.delete_article = function(art){
        Articles.delete(art);
    }

    $scope.view_article = function(art){
        if (art.scope_root){
            document.location= '/wiki/s/' + art.scope ;
        } else {
            document.location= '/wiki/a/' + art.scope + '/' + art.name;
        }
    }

    $scope.update_links = function(){
        $.get('/admin/wiki/relink', function(){
            document.location = '/admin/wiki/articles?flash_info=' + encodeURI('Articles Relinked');
        })
    }

}

ArticlesCtrl.$inject = ['$scope', '$filter', '$compile', 'Articles'];


