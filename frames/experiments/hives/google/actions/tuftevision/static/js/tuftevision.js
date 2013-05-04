$(function () {

	(function($){

		$.fn.shuffle = function() {

			var allElems = this.get(),
				getRandom = function(max) {
					return Math.floor(Math.random() * max);
				},
				shuffled = $.map(allElems, function(){
					var random = getRandom(allElems.length),
						randEl = $(allElems[random]).clone(true)[0];
					allElems.splice(random, 1);
					return randEl;
				});

			this.each(function(i){
				$(this).replaceWith($(shuffled[i]));
			});

			return $(shuffled);

		};

	})(jQuery);

	var searches = [];

	var $container = $('#content');
	var template = _.template('<a href="http://www.google.com<%= href %>" ' +
		' target="imageDetail"	class="variable-size width<%= wn %> height<%= hn %>"' +
		' style="background-image: url(\'<%= src %>\') ">&nbsp;</a>');

	var iset = false;

	var style_template = _.template('#content a.width<%= i %> { width: <%= i * s  %>px; }#content a.height<%= i %> { height: <%= i * s %>px; }');

	var last_s = 0;

	function zoomOutSearch(t){
		$('.form-search').addClass('zoomed').animate({
			width: '50%',
			'right': $(window).width()/4,
			'top': $(window).height()/2
		}, t | 500);
	}
	zoomOutSearch(1500);
	function zoomInSearch(t){
		$('.form-search').removeClass('zoomed').animate({
			width: '40%',
			'right': 0,
			'width': '60%',
			'top': 0
		}, t | 500);
	}

	$('.form-search button.zoom').click(zoomInSearch);

	$('.form-search').submit(function () {
		var q = $('.form-search input.query').val();
		console.log('searching for ', q);
		$.post("/experiments/tuftevision.json",
			{
				query: q,
				offset: _.filter(searches, function(term){
					return term.toLowerCase() == q.toLowerCase();
				}).length
			}, function (data) {

				$('.search-form .searches').append($('<button class="btn label">' + q + '</button>'));

				console.log('data:', data);

				if (last_s != data.s) {
					for (i = 1; i <= (200 / data.s); ++i) {
						$('#dynamicStyle').text($('#dynamicStyle').text() + style_template(data));
					}
					last_s = data.s;
				}

				if (!iset) {

					_.each(data.images, function (img) {
						$('#content').prepend(template(img));
					});

					$container.isotope({
						itemSelector:   'a',
						layoutMode:     "perfectMasonry",
						perfectMasonry: {
							columnWidth: data.s,
							rowHeight:   data.s
						}
					});
					iset = true;
				} else {


					var t = _.reduce(data.images, function (o, img) {
						return o + template(img)
					}, '');
					var $newItems = $(t);
					$('#content').prepend($newItems).isotope('addItems', $newItems).isotope('reloadItems').isotope({ sortBy: 'original-order' });
				}
			});
		searches.push(q);
		return false;
	});

});