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

    /* *************** MODEL ************************** */

    $scope.scopes = Scopes.query();  // Scopes.query();
    $scope.colspan = 7;

    $scope.add_scope = function () {
        document.location = '/admin/wiki/create_scope';
    }

    $scope.edit_scope = function (s) {
        document.location = '/wiki/se/' + s.scope;
    }

    $scope.export_scope = function (s) {
        document.location = '/admin/wiki/export/' + s.scope;
    }

    $scope.view_scope = function (s) {
        document.location = '/wiki/s/' + s.scope;
    }

    $scope.delete_scope = function(s){
        alert('deleting ', s);
        Scopes.delete(s, function(err){
            console.log('delete result: ', err);
            $scope.scopes = Scopes.query();
        })
    }

}

ScopesCtrl.$inject = ['$scope', '$filter', '$compile', 'Scopes'];


