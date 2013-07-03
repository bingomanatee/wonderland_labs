All data intended for digestion by your page template, or transmission as JSON, should be put in context.$out. 

By default context.$out is a `hive-config` object with a very simple api: 

``` javascript

context.$out.set('foo', 3);
console.log('foo: %s', context.$out.get('foo'));

```

This $out property's manifest is translated to a plain object before it is passed through the ?[View Helpers](view_helpers). 

However, if you find this too cumbersome, you can replace context.$out with a generic object. In fact if you are writing a REST action, you can even replace it with an array if you'd like.