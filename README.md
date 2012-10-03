# Nuby-Expres Bootstrap

This is a "seed" project for a Nuby-Express site, styled with Twitter Bootstrap. It also contains the
Noogle module.

There are two "launch" scripts.

 * index.js is what you should launch in node or forever -- sudo node.js
   (in practice I find you often need sudo to access port 80).

 * web.js is a true module. It exposes a function that launches a server and returns the framework as the output
   of that function. Note that you can pass configuration options into the function to
    * override the port
    * change the name of the default database

This makes the web.js file a useful tool for unit tests. You can write each test with a different port
and database and not worry about overlap. (as long as you destroy the database at the end of the test...)

By default the core logger of Node will write to logs/nuby_express.log.

the ./run bash script will trigger launch as well. sudo ./run is the easiest way to kick open the app;
that is, when developing. I reccommend using forever or an equivalent maintenance daemon in production.

## Environmental requirements

* The elasticSearch in app/components/com_noogle/node_modules/vendor must have been initalized.
* MongoDB must be running.
* You must have a Node environment at 0.8.x (or greater?) in your system.
* This has not been tested under Windows.
* It should run on MacOSX and Ubuntu. 