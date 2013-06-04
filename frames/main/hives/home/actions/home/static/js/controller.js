console.log('controller loaded');

(function () {

	var homeApp = angular.module('home', ['articleservices', 'ngGrid']);

	angular.module('articleservices', ['ngResource']).factory('Articles',
		function ($resource) {
			return $resource('/blog_rest/articles/:name', { name: '@name'}, {
				//	get:{method:'GET'},
				query: {method: 'GET', url: '/blog_rest/articles', isArray: true}//,
				//	add:{method:'POST' },
				//	update:{method:'PUT' },
				//	delete:{method:'DELETE'}
			});
		});

	function ArticleController($scope, $filter, $compile, Articles) {

		$scope.articles = Articles.query();

		$scope.tags = function () {
			var out = _.sortBy(_.uniq(_.compact(_.flatten(_.pluck($scope.articles, 'tags')))), _.identity);
			console.log('tags:', out);
			return out;
		};

		$scope.folders = function () {
			var out = _.sortBy(_.uniq(_.compact(_.pluck($scope.articles, 'folder'))), _.identity);
			console.log('folders:', out);
			return out;
		};

		$scope.view = 'cards';

		$scope.clear_filters = function(){
			$scope.clear_tag_filter();
			$scope.clear_folder_filter();
		}

		$scope.clear_tag_filter = function () {
			$scope.tag_filter = '';
		};

		var _folder_path = _.template('/blog/<%= folder %>/<%= file_name %>');
		var _file_path = _.template('/blog/<%= file_name %>');

		$scope.go = function(article){
			if (article.folder){
				document.location = _folder_path(article);
			} else {
				document.location = _file_path(article);
			}
		};

		$scope.set_tag_filter = function (tag) {
			$scope.tag_filter = tag;
		};

		$scope.clear_folder_filter = function () {
			$scope.folder_filter = '';
		};

		$scope.set_folder_filter = function (folder) {
			$scope.folder_filter = folder;
		};

		$scope.get_articles = function () {
			return _.filter($scope.articles, function (article) {
				if ($scope.tag_filter && (!_.contains(article.tags, $scope.tag_filter))) {
					return false;
				}

				if ($scope.folder_filter && ( article.folder != $scope.folder_filter)) {
					return false;
				}

				return true;
			})
		};

		$scope.nav_class = function (item) {
			if (item == $scope.view) {
				return 'active';
			} else {
				return '';
			}
		};

		setInterval(function () {
			console.log('scope: ', $scope);
		}, 5000);

		$scope.gridOptions = {
			data:           'get_articles()',
			showGroupPanel: true,
			showFilter:     true,
			columnDefs:     [
				{field: 'folder', displayName: 'Folder', width: "**"},
				{field: 'file_name', displayName: 'Name', width: '***', groupable: false},
				{field: 'title', displayName: 'Title', width: '*****', groupable: false},
				{field: 'intro', displayName: ' ', width: '*********', groupable: false},
				{field:           'tags', displayName: 'Tags', width: '***', groupable: false,
					cellTemplate: '<div>' +
					                  '<div class="ngCellText" ng-class="col.colIndex()" ' +
					                  'title="{{row.getProperty(col.field).join(\', \') }}">' +
					                  '{{row.getProperty(col.field).slice(0, 2).join(\', \') }}' +
						'</div></div>'

				}
			]

		};

		$scope.set_nav_mode = function (mode) {
			console.log('setting nav mode:', mode);
			$scope.view = mode;
		}

		window.ngGrid.i18n['en'].ngGroupPanelDescription = 'Drag columns here to group'
	}

	ArticleController.$inject = ['$scope', '$filter', '$compile', 'Articles'];

	homeApp.controller('ArticleCtrl', ArticleController);
})();

