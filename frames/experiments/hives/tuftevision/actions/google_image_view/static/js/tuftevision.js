function encodeSearchTerm(term) {
	return term.toLowerCase().replace(/[^\w]+/g, '-');
}

function shuffle_images() {
	$('#content').isotope('shuffle');
	return false;
}

var img_link = _.template('<span class="close" onClick="close_popover()">&times;</span> ' +
	'<a class="img_url_title" href="<%= img_url %>" target="__new">' +
	'<%= img_url %></a> ');

var popover_content = _.template('<img src="<%= img_url %>" width="<%= data.width %>" height="<%= data.height %>" />');

var popover_target;

function close_popover() {
	$(popover_target).popover('hide');
}

function flyout(src, target) {

	if (popover_target) {
		$(popover_target).popover('hide');
	}
	popover_target = target;
	console.log('flying out ', src);
	$.post('/experiments/tuftevision/image_data.json', {
		src: src
	}, function (data) {
		console.log('image data', data, 'target', target);
		$(target).popover({
			title:     img_link(data),
			html:      true,
			content:   popover_content(data),
			container: $('#popover'),
			width:     '50%'
		}).popover('show');
	});
}

$(function () {


	(function ($) {

		$.fn.shuffle = function () {

			var allElems = this.get(),
				getRandom = function (max) {
					return Math.floor(Math.random() * max);
				},
				shuffled = $.map(allElems, function () {
					var random = getRandom(allElems.length),
						randEl = $(allElems[random]).clone(true)[0];
					allElems.splice(random, 1);
					return randEl;
				});

			this.each(function (i) {
				$(this).replaceWith($(shuffled[i]));
			});

			return $(shuffled);

		};

	})(jQuery);

	var $container = $('#content');
	var image_template = _.template('<div style="background-image: url(\'<%= src %>\')" ' +
		' data-search="<%= encodeSearchTerm(query) %>" ' +
		' class="variable-size width<%= wn %> height<%= hn %>">' +
		'<a href="http://www.google.com<%= href %>" ' +
		' title="<%= text %>" ' +
		' target="imageDetail"	 >' +
		'&nbsp;</a><button type="button" class="btn btn-small btn-primary" ' +
		'onClick="flyout(\'<%= href %>\', this)"><i class="icon-info-sign icon-white"></i></button></div>');

	var iset = false;

	var badge_template = _.template('<span class="img-badge" title="get more <%= q %>s" data-search="<%= encodeSearchTerm(q) %>">' +
		'<img onClick="do_search(\'<%= q %>\')"  src="<%= src %>" width="<%= Math.round( w * height/h )%>" height="<%= height %>"/>' +
		'<br /><h4> <span class="close" onClick="kill_images(\'<%= encodeSearchTerm(q) %>\')">&times;</span>' +
		' <span class="title" onClick="do_search(\'<%= encodeSearchTerm(q) %>\')" ><%= q.replace(/\-/g, " ") %></span>' +
		' </h4></span>')

	var style_template = _.template('#content div.width<%= i %> { width: <%= i * s  %>px; }#content div.height<%= i %> { height: <%= i * s %>px; }');

	var last_s = 0;
	var firstSearch = true;

	function zoomOutSearch(t) {
		$('#content').animate({'margin-top': 0}, t | 500);
		$('.form-search').addClass('zoomed').animate({
			width:   '50%',
			'right': $(window).width() / 4,
			'top':   $(window).height() / 2
		}, t | 500);
		$('.form-search button.zoom').off('click').click(zoomInSearch);
	}

	zoomOutSearch(1500);
	function zoomInSearch(t) {
		$('#content').animate({'margin-top': '2em'}, t | 500);
		$('.form-search').removeClass('zoomed').animate({
			width:       '40%',
			'right':     0,
			'width':     '60%',
			'top':       0,
			'text-size': '50%'
		}, t | 500);
		$('.form-search button.zoom').off('click').click(zoomOutSearch);

	}

	$('.form-search button.zoom').click(zoomInSearch);

	$('.form-search').submit(function () {
		if (firstSearch) {
			zoomInSearch();
			firstSearch = false;
		}
		var q = $('.form-search input.query').val();
		console.log('searching for ', q);

		window.search_for_term(q);
		return false;
	});


	window.search_for_term = function (q) {

		var qs = encodeSearchTerm(q).toLowerCase();

		var post_data = {
			query:  q,
			s:      10,
			pages:  2,
			offset: _.filter(ws.searches,function (term) {
				return term.toLowerCase() == qs;
			}).length
		};

		$.post("/experiments/tuftevision/google_image_view.json",
			post_data, function (data) {

				if (!post_data.offset) {
					var badge_info = _.extend({q: q, height: 40}, data.images[0]);

					$('#searches').append(badge_template(badge_info));
					console.log('badge: ', badge_info);
				}

				console.log('data:', data);

				if (last_s != data.s) {
					for (i = 1; i <= (100); ++i) {
						$('#dynamicStyle').text($('#dynamicStyle').text() + style_template(data));
					}
					last_s = data.s;
				}

				if (!iset) {

					_.each(data.images, function (img) {
						$('#content').prepend(image_template(_.extend({query: q}, img)));
					});

					$container.isotope({
						itemSelector:   'div',
						layoutMode:     "perfectMasonry",
						perfectMasonry: {
							columnWidth: data.s,
							rowHeight:   data.s
						}
					});
					iset = true;
					do_search(q);
				} else {

					var t = _.reduce(data.images, function (o, img) {
						return o + image_template(_.extend({query: q}, img));
					}, '');
					var $newItems = $(t);
					$('#content').prepend($newItems).isotope('addItems', $newItems).isotope('reloadItems').isotope({ sortBy: 'original-order' });
				}
			});

		ws.searches.push(encodeSearchTerm(q));
		ws.set_url();
	};

	var Workspace = Backbone.Router.extend({
		searches: [],

		routes: {
			":terms": "query"    // #help
		},
		set_url: function(){

				ws.navigate(_.uniq(ws.searches).join(','), {trigger: false});
		},

		remove_searches: function(term){
			term = encodeSearchTerm(term);
			this.searches = _.difference(this.searches, [term]);
		}

	});

	window.ws = new Workspace();

	window.ws.on('route:query',
		function (terms) {
			console.log("querying", terms);
			if (!terms) {
				return;
			}

			terms = _.map(terms.split(','), encodeSearchTerm);

			function popTerm() {
				var term = terms.shift();
				if (term && (!_.contains(ws.searches, term))) {
					window.search_for_term(term);
				}
				if (terms.length) {
					setTimeout(popTerm, 1500);
				}
			}

			popTerm();
		}
	)

	Backbone.history.start();
});

function do_search(search) {
	$('.form-search input.query').val(search.replace(/-/g, ' '));
	$('.form-search').submit();
}

function kill_images(tag) {
	console.log('killing images with ', tag);

	$('#content').isotope('remove', $('#content').find('[data-search=' + encodeSearchTerm(tag) + ']'));
	$('#searches span[data-search=' + encodeSearchTerm(tag) + ']').remove();

	ws.remove_searches(tag);
	ws.set_url();
	return false;
}