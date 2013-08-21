module.exports = {

    on_validate: function(context, done){

        if (!context.id){
            context.add_message('must have ID', 'error');
            context.$go('/', done)
        } else {
            done();
        }
    },

    on_input: function(context, done){
       this.model('mock_tweets').get(context.id, function(err, tweet){
           if(!tweet){

               context.add_message('cannot find tweet ' + context.id, 'error');
               context.$go('/', done)
           } else {
               context.$out.set('tweet', tweet);
               done();
           }
       })
    }



}