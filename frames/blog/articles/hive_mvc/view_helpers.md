View helpers are resources that allow you to filter the output of your actions after an action occurs and before the template is rendered. 

Every view helper, by default, filters every action; there is no inflection of view helpers based on which action/hive/frame's ?[resource_folder](resource_folders) hosts it.

Here is a sample view_helper:

``` javascript

module.exports = function (apiary, cb) {

	var helper = {

		test: function (ctx, output) {
		    return true;
		},

		weight: 0,

		respond: function (ctx, output, done) {
			ctx.link = _.template('<a href="<%= href %>"><%- text %></a>');
done(); // note - no parameters required for this callback
		}
	};

	cb(null, helper); // note - MUST pass the manifest to this callback. 
};

```

View helpers are called in ascending order of weight. You can implement the test method to selectively skip the response call when it is not useful. In general it is a good idea for there to be as much independence of execution between view_helpers as possible. 

The output variable can be modified by the execution of response(). 

If you set the `post` property to true, the view helper will execute AFTER the template has been rendered; that is how the layout view helper operates. 

In this case, the api for request is as follows: 

``` javascript
{
...
respond: function (ctx, output, html, cb) {
.... 
 cb(null, ctx, output, html);
}
```

As should be obvious, changing the output object at this point will NOT cause the HTML to be re-rendered, and the callback MUST be passed the state variables as they came in. 

Post-helpers should be rare; they are good for things like language/obscenity filters, layouts, compression and other fairly global activities.

## Accessing callback-centric resources

There are two callbacks in the view_helper definition; one that the manifest is passed into, and one that, for each request, the control waterfalls through. 

If you are doing things that only need to be done once, at bootup, like loading a file template, do that in front of the outer callback, before you return the view_helper manifest. 

If you are doing async activity that is context sensitive, like looking up messages for a user, that should go in the response method, prior to the inner callback.