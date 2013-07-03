![buckets.png](/blog_image/buckets.png)

The request pipe for each request/response cycle is fairly deep. The following diagram illustrates it in depth. 

![hive_flow_600.png](/blog_image/hive_flow_600.png)

There are five basic phases to the delivery of a response from a Hive action:

1. **The Express "use" pipe:** this includes any preprocessors, and the ?[Static File](static_files) delivery system. 
2. **The Action Script:** This is the script you write to make the backend of your action unique; it can include reading and writing to file and model systems/databases to and from the request/response data. the net output from this activity is saved in the ?[$out](action_output) property of the action. 
3. **The View Helpers:** The ?[context](context) and ?[output](action_output) are then piped through one or more ?[view helpers](view_helpers) which can add functions and data to the output for later use in the templating engine. An example would be adding functions to generate widgets for login/logout, adding menu data for navigation, etc. 
4. **Template Rendering**: The output object is then passed along with the Actions' ?[template](action_templates) into a templating engine. At this point, EJS is supported. 
5. **Post Processing**: A special set of view helpers are marked as "post processors. They take the output of the templating engine (an HTML string) and the output variables and do any necessary final activity; the ?[hive_layout](hive_layout) helpers are a good example of this kind of activity. 

The output of this pipe is then sent as a response, as HTML text.

## ... Unless it's not.

Not all responses are HTML. If an action has no template, OR if the action calls one of ?[contexts'](context) "Routing Methods:

* **context.$send({obj}, callback(**
* **context.$sendfile(path{string}, callback)**
* **context.$go(path or URL {string}, callback)**

then as shown in the above document, the request flow is suspended and the appropriate content is sent to the response and expressed as JSON (or other formats as appropriate).