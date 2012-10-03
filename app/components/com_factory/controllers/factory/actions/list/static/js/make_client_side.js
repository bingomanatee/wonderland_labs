var NE_MAKE =  {};
$(function(){
    NE_MAKE.add_component = function(root, type){
        $('#new_comp input[name="root"] ').val(root);
        $('#new_comp input[name="type"] ').val(type);
        $('#new_comp .root').text(root);
        $('#new_comp .root_type').text(type);
       // $('#new_comp input[name="comp_name"]').val('(new controller name)');
        $('#new_comp').dialog({width: '80%', title: 'Add Component'});
    };

    NE_MAKE.add_controller = function(root, type){
        $('#new_con input[name="root"] ').val(root);
        $('#new_con input[name="type"] ').val(type);
        $('#new_con .root').text(root);
        $('#new_con .root_type').text(type);
       // $('#new_con input[name="con_name"]').val('(new controller name)');
        $('#new_con').dialog({width:  '80%', title: 'Add Controller'});
    
        return false;
    }

    NE_MAKE.add_action = function(root, type){
        $('#new_action input[name="root"] ').val(root);
        $('#new_action input[name="type"] ').val(type);
        $('#new_action .root').text(root);
        $('#new_action .root_type').text(type);
       // $('#new_action input[name="con_name"]').val('(new controller name)');
        $('#new_action').dialog({width:  '80%', title: 'Add Action'});
    
        return false;
    }
})

/*
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/base/jquery-ui.css" type="text/css" media="all" />
    <script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.5.min.js" type="text/javascript"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/jquery-ui.min.js" type="text/javascript"></script>
    */