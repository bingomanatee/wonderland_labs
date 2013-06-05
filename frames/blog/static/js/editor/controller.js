console.log('controller loaded');

(function () {

	var homeApp = angular.module('article', ['articleRestService' ,'ui.bootstrap']);

	angular.module('articleRestService', ['ngResource']).factory('Articles',
		function ($resource) {
			return $resource('/blog_rest/article/:folder?/:file', { name: '@name'}, {
				get:    {method: 'GET'},
				query:  {method: 'GET', isArray: true},
				add:    {method: 'POST' },
				update: {method: 'PUT' },
				delete: {method: 'DELETE'}
			});
		});

	function ArticleEditor($scope, $filter, $compile, Articles) {

		$scope.folders = ['alpha', 'beta'];
		$scope.article = {
			title: 'New Article',
			file_name: 'new_article',
			folder: null
		}; // Articles.get(file_name, folder);
/*
		$scope.get_articles = function () {
			var articles = $scope.article.slice(0);

			// perform any dynamic filtering here

			return articles;
		}

		$scope.gridOptions = {
			data:           'get_articles()',
			showGroupPanel: true,
			showFilter:     true,
			columnDefs:     [
				{field: 'name', displayName: 'Name', width: "**", groupable: false},
				{field: 'type', displayName: 'Type', width: "*"}
				// more fields here
			]

		};*/

		setTimeout(function(){
			$('#folder_select').combobox();
			$('#content_html').wysihtml5({useLineBreaks: false, stylesheets: []});
		}, 2000);

	}

	ArticleEditor.$inject = ['$scope', '$filter', '$compile', 'Articles'];

	homeApp.controller('ArticleEditor', ArticleEditor);
})();

