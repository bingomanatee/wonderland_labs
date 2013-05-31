
function preview_text(){

	var text = $('#text').val();

	$('#preview').html(marked(text));

}

setInterval(preview_text, 3000);