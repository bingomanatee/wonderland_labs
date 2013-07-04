The two dominant frameworks can be blended ... if you know what you are doing and take care to respect the basic precepts of each framework.

## Embedding Angular into Bootstrap

Angular in general assumes two things:

1. It is working off of a block of markup that existed on page load
2. All the javascript classes that are required to handle Angular directives present before the parsing of said markup begins. 

The second requirement cannot be obviated; if you start to parse a block of Angular enhanced code without the controller code in place, an error occurs.

However, the first requirement is not a deal breaker, as you can load and parse a block of angular enhanced code after the page has loaded. 

This can be accomplished inside the context of a view helper with a remarkably small amount of markdown:

``` javascript
 var My_View = Backbone.View.extend({
		el: '#stockOptions'

		, initialize: function() {

			_.extend(this, Backbone.Events);
			this.render();
		}
		
		, render: function () {
			this.angularizeTemplate();
		}

		, angularizeTemplate: function () {
			if (this.angularScope){
			    this.angularScope.$destroy();
			}
		
			var self = this;
			$.get(myTemplateURL, function(AngularViewMarkup){ 
				self.$el.html(AngularViewMarkup);
				var el = $(self.el).find('.controller'); 
// assumes the ng-controller element has been flagged with a class for convenience. 
				if (!el) {
					return;
				}
				angular.bootstrap(el, ['dt']); // the app class

				self.angularScope = angular.element(el).scope();
				el.show();
			});
		}
	});
});

```

## Embedding Bootstrap into Angular 

There is a bit more risk here in that Angular has DOM update events that are out of your control. 

That being said, Angular does not have cause to update a DOM element that has no angular modifying properties; so, within a controller definition, you can try assigning a Backbone view to a specific element within your template. 

The [angular.element](http://docs.angularjs.org/api/angular.element) method may be useful in creating context for linking content and Backbone.