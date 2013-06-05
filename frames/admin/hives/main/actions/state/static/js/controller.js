console.log('controller loaded');

(function () {

	var homeApp = angular.module('state', ['routeService', 'ngGrid']);

	angular.module('routeService', ['ngResource']).factory('Routes',
		function ($resource) {
			return $resource('/admin/routes/:file_name', { file_name: '@file_name'}, {
				get:    {method: 'GET'},
				query:  {method: 'GET', url: "/admin_routes", params: {}, isArray: true},
				add:    {method: 'POST' },
				update: {method: 'PUT' },
				delete: {method: 'DELETE'}
			});
		});

	function StateController($scope, $filter, $compile, Routes) {

		$scope.routes = Routes.query();

		$scope.get_routes = function () {
			var routes = $scope.routes.slice(0);

			// perform any dynamic filtering here

			return routes;
		}

		$scope.gridOptions = {
			data:           'routes',
			showGroupPanel: true,
			showFilter:     true,
			columnDefs:     [
				{field: 'action', displayName: 'Action', width: "**"},
				{field: 'method', displayName: 'Method', width: "*"},
				{field: 'path', displayName: 'Route', width: "***", groupable: false},
				// more fields here
			]

		};

	}

	StateController.$inject = ['$scope', '$filter', '$compile', 'Routes'];

	homeApp.controller('StateController', StateController);
})();

