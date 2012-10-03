var NE = require('nuby-express');

module.exports = {
    start_server: function(server, target, cb){
      //  console.log('applying bp');
        server.use(NE.deps.express.bodyParser());
        cb();
    }
}