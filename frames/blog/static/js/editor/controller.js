(function () {

	var homeApp = angular.module('article', ['articleRestService' , 'ui.bootstrap']);

	angular.module('articleRestService', ['ngResource']).factory('Articles',
		function ($resource) {
			return $resource('/blog_rest/articles/:folder/:file_name', {
					file_name: '@file_name', folder: '@folder'}
				, {
					get:    {method: 'GET'},
					query:  {method: 'GET', isArray: true},
					add:    {method: 'POST' },
					update: {method: 'PUT' },
					delete: {method: 'DELETE'},
					exists: {method: 'GET', params: {exists: true}}
				});
		}).factory('Images',
		function ($resource) {
			return $resource('/blog_image/:file', {file: '@file'}, {
				get:    {method: 'GET'},
				query:  {method: 'GET', params: {file: ''}, isArray: true},
				add:    {method: 'POST' },
				update: {method: 'PUT' },
				delete: {method: 'DELETE'}
			});
		});

	function ArticleEditor($scope, $filter, $compile, Articles, Images) {

		$scope.get_article = function (art) {
			$scope.article = Articles.get(art);
		};

		$scope.SUBMIT_BUTTON_LABEL = 'Save Article';

		$scope.$watch('article.exists', function (ex) {
			if (ex) {
				$scope.SUBMIT_BUTTON_LABEL = 'Update Article';
			} else {
				$scope.SUBMIT_BUTTON_LABEL = 'Create Article';
			}

			choose_tab('markdown');
		})


		$scope._apply = function (f) {
			try {
				if (!$scope.$$phase) {
					$scope.$apply(f);
				} else {
					if (f) {
						f();
					}
				}
			} catch (e) {
				throw e
			}
		};

		$scope.control_group_row = function (item) {
			var classes = ['control-group', 'control-group-row'];
			var target = $scope.article_edit_form[item];
			if (target && !target.$valid) {
				classes.push('error');
			}
			if ((item == 'file_name') && ($scope.article.exists) && (!_.contains(classes, 'error'))) {
				classes.push('warning');
			}
			return classes.join(' ');
		};

		var afn_delay;

		$scope.$watch('article.file_name', start_check_exists);
		$scope.$watch('article.folder', start_check_exists);

		function start_check_exists() {
			if (afn_delay) {
				clearTimeout(afn_delay);
			}
			if ($scope.article.file_name) {
				afn_delay = setTimeout(check_exists, 1200);
			}
		}

		function check_exists() {
			afn_delay = null;

			Articles.exists({
					file_name: $scope.article.file_name,
					folder:    $scope.article.folder || ''}
				, function (result) {
					$scope.article.exists = result.exists;
					$scope.existence_tested = true;
				});
		}

		$scope.show_image = function (image) {
			$scope.active_image = image;
			$scope.open_image_dialog();
		};

		var md_img_template = _.template('![<%= name %>](<%= url %>)');
		$scope.active_image_markdown = function () {
			return md_img_template({url: $scope.active_image_source(), name: $scope.active_image.name});
		};

		$scope.add_to_markdown = function () {
			$scope.article.content += "\n\n" + $scope.active_image_markdown() + "\n\n";
			$scope.close_image_dialog();
		};

		$scope.active_tabs = {
			markdown: true
		};
		/*

		 var md_clippy_template = _.template('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy" >' +
		 '<param name="movie" value="/js/blog/vendor/clippy.swf"/>' +
		 '<param name="allowScriptAccess" value="always" />' +
		 '<param name="quality" value="high" />' +
		 '<param name="scale" value="noscale" />' +
		 '<param NAME="FlashVars" value="text=<%= content %>">' +
		 '<embed src="/js/blog/vendor/clippy.swf" width="110" height="14" name="clippy" quality="high"  allowScriptAccess="always" type="application/x-shockwave-flash"  pluginspage="http://www.macromedia.com/go/getflashplayer" FlashVars="text=<%= content %>"  />' +
		 '				</object>');

		 $scope.$watch('active_image', function(image){
		 if(image && image.name){
		 var mct = md_clippy_template({content: $scope.active_image_markdown()});
		 console.log('embedding ', mct);
		 $('#image_clippy').html(mct);
		 }
		 }, true);
		 */

		$scope.content = '';
		$scope.overwrite = false;

		$scope.markdown_to_html = function (content) {
			if (html_editor) {
				$scope.source = marked($scope.article.content || content || '');
				html_editor.composer.setValue($scope.source);
			}
		};

		function choose_tab(choice) {
			_.each($scope.active_tabs, function (v, tab) {
				$scope.active_tabs[tab] = false;
			})
			$scope.active_tabs[choice] = true;
		}

		$scope.revert_to_markdown = function () {
			$scope.markdown_to_html();
			choose_tab('markdown');
		};

		$scope.accept_html = function () {
			var html = html_editor.composer.getValue();
			$scope.article.content = toMarkdown(html);
			choose_tab('markdown');
		};

		$scope.$watch('article.content', $scope.markdown_to_html);
		$scope.show_image_dialog = false;

		$scope.active_image_source = function () {
			return '/blog_image/' + $scope.active_image.name;
		};

		$scope.open_image_dialog = function () {
			$scope.show_image_dialog = true;
		};

		$scope.close_image_dialog = function () {
			$scope.closeMsg = 'I was closed at: ' + new Date();
			$scope.show_image_dialog = false;
		};

		$scope.image_dialog_options = {
			backdropFade: true,
			dialogFade:   true
		};

		$scope.insert_test_article = function () {
			$scope.article.content = "# headline\n\n this is body\n\n * bullet\n * bullet 2\n\n ![dave2.jpg](/blog_image/dave2.jpg)\n\n## Head 2"
		}

		$scope.html_to_markdown = function () {
			var html = html_editor.composer.getValue();
			var converted = toMarkdown(html);
			// simulating converted error
			var alter = false;
			if (alter) {

				converted = converted.split("\n");
				var line = converted.splice(3, 2, '');
				line.unshift('');
				converted.push.apply(converted, line);
				converted = converted.join("\n");
			}

			console.log('parsing ', converted);

			var conv_back = marked(converted).replace(/strong>/g, 'b>');
			var comp = prettydiff({
				source:   html,
				diff:     conv_back,
				mode:     'diff',
				lang:     'markup',
				diffview: 'inline',
				quote:    false,
				html:     true
			});

			$scope.conversion = comp[0].replace(/<(\/)?em>/g, '');
			$scope.active_tabs.comparison = true;
			$scope.active_tabs.html = false;

			//$scope.article.content = converted;
		};

		$scope.images = Images.query();

		$scope.folders = ['alpha', 'beta'];
		$scope.article = {
			title:     'New Article',
			file_name: 'new_article',
			content:   '',
			folder:    null
		}; // Articles.get(file_name, folder);

		$scope.set_file_name = function(n){
			$scope.article.file_name = n;
		}

		var sfci;
		$scope.set_folder = function(f){
			$scope.article.folder = f;
		}
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

		$scope.thumb_path = function (image) {
			return '/blog_thumb/50/50/' + image.name;
		};

		var html_editor;

		setTimeout(function () {
			var chtml = $('#content_html');

			chtml.wysihtml5({useLineBreaks: false, stylesheets: [], html: false, color: true,
				//@TODO: figure out how to not damage img with html editing
				stylesheets:                ["/js/blog/vendor/bootstrap-wysihtml5/wysiwyg-color.css"], // (path_to_project/lib/css/wysiwyg-color.css)
				locale:                     "en"

			});

			html_editor = chtml.data("wysihtml5").editor;
		}, 500);

		$scope.upload_image = function () {
			var input = $('#upload_form').find('input[name=file_input]');
			var data = new FormData(input);
			try {
				jQuery.each(input[0].files, function (i, file) {
					data.append('image', file);
				});

				$.ajax({
					type:        'post',
					data:        data,
					url:         '/blog_image',
					cache:       false,
					contentType: false,
					processData: false,
					success:     function (data) {
						console.log('data from success: ', data);
						$scope.images = Images.query();
						$scope._apply()
					}
				});
			} catch (err) {
				console.log(err);
			}
			return false;
		};

		$scope.save_article = function () {

			function handler(article) {
				$scope.$broadcast('saved_article', article)

			}

			if($scope.overwrite){
				Articles.update($scope.article, handler);
			} else {
				Articles.add($scope.article, handler);
			}
		}
	}

	ArticleEditor.$inject = ['$scope', '$filter', '$compile', 'Articles', 'Images'];

	homeApp.controller('ArticleEditor', ArticleEditor);
})();

