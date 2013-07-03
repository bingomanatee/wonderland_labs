Right now, Hive-MVC only accepts [EJS Templates](https://github.com/visionmedia/ejs). 

All the ?[output](output) of an ?[action](actions), as processed by ?[view_helpers](view_helpers), serve as local variables for your template.

The template executes in the node.js context, so all node/javascript syntax is available. Also, the underscore library is bundled in as well. 

Naturally you cannot include any callback-centric code in your template.