
function preview_text(){

	var text = $('#text').val();

	$('#preview').html(marked(text));

}

$(preview_text);