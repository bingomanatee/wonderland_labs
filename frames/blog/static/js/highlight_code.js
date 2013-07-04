(function(){

	function compress(ele){

		var text = "\n" + ele.text();
		var indents = /\n([ ]+)/g;
		var indent;
		var counts = [];

		while(indent = indents.exec(text)){
			console.log('indent: ', indent);
			counts.push(indent[1].length);
		}

		 counts = _.sortBy(_.uniq(counts), _.identity).reverse();

		_.each(counts, function(count, index){
			var spaces = _.map(_.range(0, count), function(){
				return ' ';
			}).join('');
			var tabs = _.map(_.range(0, counts.length -(index + 1)), function(){
				return "\t";
			}).join('');
			text = text.replace(new RegExp("\n" + spaces, 'g'), "\n" + tabs)
		});

		text = text.replace(/\t/g, '   ');
		text = text.replace(/^[\s]+/, '');
		ele.html(text);
		console.log('indents: ');
	}

	_.each($.find('.lang-javascript'),function( ele){
		console.log('found ', ele);
		var el = $(ele);
		var pel = el.parent();
		compress(el);
		pel.addClass('sh_javascript');
		pel.addClass('sh_js');
		var code = $(ele).text();
		pel.text(code);
	});

	_.each($.find('.lang-json'),function( ele){
		console.log('found ', ele);
		var el = $(ele);
		compress(el);
		var pel = el.parent();
		pel.addClass('sh_json');
		var code = $(ele).text();
		pel.text(code);
	});

	sh_highlightDocument('/js/blog/vendor/shjs-0.6/lang/', '.js');

})()
