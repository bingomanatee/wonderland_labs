console.log('controller loaded');

(function () {

	var homeApp = angular.module('state', ['routeService', 'ngGrid']);

	angular.module('routeService', ['ngResource']).factory('Routes',
		function ($resource) {
			return $resource('/admin/state/routes', {}, {
				get:    {method: 'GET'},
				query:  {method: 'GET', isArray: true}
			});
		}).factory('StaticPaths',
		function ($resource) {
			return $resource('/admin/state/staticpaths', {}, {
				get:    {method: 'GET'},
				query:  {method: 'GET', isArray: true}
			});
		});

	function StateController($scope, $filter, $compile, Routes, StaticPaths) {

		$scope.routes = Routes.query();
		$scope.staticpaths = StaticPaths.query();

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
		$scope.staticGridOptions = {
			data:           'staticpaths',
			showFilter:     true,
			columnDefs:     [
				{field: 'alias', displayName: 'Action', width: "**"},
				{field: 'prefix', displayName: 'Method', width: "***"}
			]

		};

	}

	StateController.$inject = ['$scope', '$filter', '$compile', 'Routes', 'StaticPaths'];

	homeApp.controller('StateController', StateController);
})();

