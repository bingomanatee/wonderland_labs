$(function(){
    $('#send_tweet').submit(function(){
        var tweet = {
            user: $('#inputUser').val(),
            status: $('#inputStatus').val()
        }

        $.post("/1.1/statuses/update.json", tweet, function(content){
            document.location='/mock_twitter/tweet/' + content.id;
        })

        return false;
    })
});