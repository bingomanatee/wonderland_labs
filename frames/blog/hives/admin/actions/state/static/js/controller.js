console.log('controller loaded');

(function () {

	var homeApp = angular.module('state', ['routeService', 'ngGrid']);

	angular.module('routeService', ['ngResource']).factory('Folders',
		function ($resource) {
			return $resource('/blog_rest/folders/:name', {}, {
				get:    {method: 'GET'},
				add: {method: 'POST', params: {name: '@name'}},
				query:  {method: 'GET', isArray: true}
			});
		});

	function ArticleStateController($scope, $filter, $compile, Folders) {

		$scope.folders = Folders.query();

		$scope.folderGridOptions = {
			data:           'folders',
			showFilter:     true,
			columnDefs:     [
				{field: 'name', displayName: 'Name', width: "**"}
			]

		};

		$scope.add_folder = function(){
			if (!$scope.new_folder){
				return;
			}

			Folders.add({name: $scope.new_folder}, function(){
				$scope.folders = Folders.query();
			});
		}
	}

	ArticleStateController.$inject = ['$scope', '$filter', '$compile', 'Folders'];

	homeApp.controller('ArticleStateController', ArticleStateController);
})();

