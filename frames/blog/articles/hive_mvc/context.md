Hive has an object that travels through the lifetime of a single request called a "Context". This takes the place (contains, actually) the typical request and response objects and has several methods for common request related activity. 

The Context object also contains a summary of query string params, URL parameters, post/put variables, et.al from the request data. In the event of namespace collision, inspect the source request for original request variables. 

## Context API

<dl>
<dt>$req, $res</dt>
<dd>These are the original request and response objects from Express.</dd>
</dl>

### Routing Methods
<dl>
<dt>$send({object}, done{function}?)</dt>
<dd>This allows you to manually send an object of output as JSON to the response. This is useful for writing an action that both uses an HTML template AND delivers REST data, depending on the situation. This will short circuit the [[request_flow]](request flow).</dd>
<dt>$sendfile(file_path{string}, done{function}?)</dt>
<dd>This sends a given file directly to the response.  This will short circuit the [[request_flow]](request flow).</dd>
<dt>$go(path{string}, done{function}?)</dt>
<dd>This executes a redirect to the given path/url.  This will short circuit the [[request_flow]](request flow).</dd>
</dl>

### Session methods 

<dl>
<dt>$session(key{string})</dt>
<dd>Returns the value of the session for the given key.</dd>
<dt>$session_set(key{string}, value{variant})
<dd>Inserts a value into the session.</dd>
</dl>

### Utility methods
<dl>
<dt>$parse_body()</dd>
<dd>An internal method for extracting the request variables (querystring params et.all) into the context object as local parameters.
</dl>

Note that it is fairly easy to create a context absent of true HTTP activity for [[testing_actions]](unit testing Hive actions).