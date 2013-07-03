_.each($.find('.lang-javascript'),function( ele){
	console.log('found ', ele);
	var el = $(ele);
	var pel = el.parent();
	pel.addClass('sh_javascript');
	pel.addClass('sh_js');
	var code = $(ele).text();
	pel.text(code);
});

_.each($.find('.lang-json'),function( ele){
	console.log('found ', ele);
	var el = $(ele);
	var pel = el.parent();
	pel.addClass('sh_json');
	var code = $(ele).text();
	pel.text(code);
});

sh_highlightDocument('/js/blog/vendor/shjs-0.6/lang/', '.js');