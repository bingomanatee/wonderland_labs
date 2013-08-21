$(function(){
    $.get("/1.1/statuses/user_timeline.json", {user: user}, function(data){
        (data = data.slice(0, 20));
        $("#output").text(JSON.stringify(data));
    });
});