One of the big "magic" elements of an MVC app is to turn a set of files in folders into a dynamic system, based on file / folder location and file name conventions. 

This act is isolated in ?[hive-MVC](hive_mvc/hive_mvc) because its quite likely that a developer might want this pattern without wanting, say, the rest of Hive-MVC.

A simple recursive scan can be executed using `node-dir`. Where hive-loader comes into its own is where you want a set of handlers that trigger on various file patterns, and you want to reuse/recurse with some handler/search patterns in deeper contexts.

The basic pattern of the hive-loader system is to 

1. define a loader which is designed to process a directory and trigger events on occurrences of files and subfolders.
2. define one or more handlers which respond to specific file or directory patterns.

It is quite common for handlers to then spawn sub-loaders for hits on specific folder patterns. 

## Example

Here is a directory scanner, taken from the test case of hive-loader:

#### dir_scanner.js

``` javascript 

var Loader = loader.loader;
var Handler = loader.handler;
var _ = require('underscore');
var path = require('path');
var util = require('util')

var dir_handler = require('./../handlers/dir_file');
var file_handler = require('./../handlers/txt_file');

function File_Loader(mixins, config, cb) {

	console.log('name_filter: %s', config.name_filter);

	var fh = file_handler({}, {name_filter: config.name_filter, target: loader});
	var dh = dir_handler({}, {target: loader, name_filter: /.*/, file_name_filter: config.name_filter} );

	return Loader(
		[
			mixins,
			{name:     'dir_scanner'}
		],
		[
			{
				handlers: [fh, dh],
				name_filter: /.*/
			},
			config
		], cb);
}

module.exports = File_Loader;

```

Here are the handlers for a file and directory hit:

#### dir_file.js

``` javascript

var loader = require('hive-loader');
var Handler = loader.handler;
var _ = require('underscore');

module.exports = function (mixins, config, cb) {
	var file_name_filter = config.file_name_filter;

	var _mixins = {
		name:    'dir_handler',
		respond: function (params) {
			var dir_scanner = require('./../loaders/dir_scanner');
			var latch = params.gate.latch();
			var ds =  dir_scanner({}, {name_filter: file_name_filter});
			ds.core(params.core);
			ds.load(latch, params.file_path);
		}
	};
	return Handler([mixins, _mixins], [{dir: true}, config, {name_filter: /.*/}], cb);
};

```

note - on a found directory, (and the name filter for this handler will hit any directory), the handler creates another dir_scanner loader, passes the core upwards and recurses. also, the file_name_filter is recursed upwards to the downstream text files. 

and for the text file hits for that loader. 

### txt_file.js

``` javascript
var Handler = loader.handler;
var _ = require('underscore');

var _mixins = {name: 'txt_handler', respond: function (params) {
	if (!params.core.files) params.core.files = [];
	if (!params.core.paths) params.core.paths = [];
	params.core.files.push(params.file);
	params.core.paths.push(params.file_path.substr(params.core.root.length));
}};

module.exports = function (mixins, config, cb) {

	return Handler(
		[
			mixins, _mixins
		],
		config
		, cb);
}

```
This text handler will find any file ending in `.txt` and put its name into the files list. 
note that the core.root is a singular value set outside the loaders' definition, to distinguish between the global search
root that initiated the recursive search. 

### Execution

To use the loader system you call:

``` javascript

	var scan_path = path.resolve(__dirname, '../test_resources/scan');

	var core = {files: [], root: scan_path};
	dir_scanner({}, {root: scan_path, core: core, name_filter: /(.*)\.txt$/i}, function (err, fl) {

		fl.load(function (err) {
			var files = core.files;
			files = _.sortBy(files, _.identity);
			t.equals(files.length, 7, 'seven text files');
			t.deepEqual(files, ['alpha.txt', 'bar.txt', 'beta.txt', 'foo.txt', 'gamma.txt', 'zeta.txt', 'zoo.txt'])
			t.end();
		}, scan_path);
	})

```

## Writing a Loading system

All initial directory parsing starts with a loader for the root directory. 

That loader must have one or more handlers to trigger off a file or directory hit. 

then call the `loader.init(callback, root_dir)` to scan a directory.

Assuming your load process is about more than just root or directory hits in a single folder, your directory handler(s) 'respond()' method will probably create another loader with its own set of handlers. This can be recursive (as for the re-use of dir_scanner above) or a custom loader based on the type of folder found. 

Keep in mind that a new loader in that handler will have to pass through the core property, which is in the params hash. 

## Handler Tips and Tricks

### handler.respond()

All the custom responsiveness (besides filename filter targeting) is handled in the respond method. 

respond takes the params property, which gives you information about state: 

``` javascript

{ 
  file: 'zoo.txt',
  root: '/Users/dedelhart/Documents/node/hive-loader/test_resources/scan/foo/marcos',
  gate:  (gate object),
  file_path: '/Users/dedelhart/Documents/node/hive-loader/test_resources/scan/foo/marcos/zoo.txt',
  core:  {object }
}

```

#### Asynchronous handling

Because most functionality of handler responses aren't async, there is no default callback; however there is a [gate (https://github.com/nakamura-to/gate)](https://github.com/nakamura-to/gate) property that you can use to spawn one or more gate.await() callbacks to ensure that async tasks complete: 

``` javascript

var loader = require('./../../index');
var Handler = loader.handler;
var _ = require('underscore');
var fs = require('fs');

var _mixins = {
      name: 'json_copier'
    , respond: function (params) {
         var done = params.gate.await();
         fs.readFile(params.file_path, 'utf8', function(err, data){
             fs.writeFile(file_path + '.bak', data, done);
         });
    }};

module.exports = function (mixins, config, cb) {

	return Handler(
		_mixins,
		config
		, cb);
}

```

#### Handler respond's execution context

the respond method of the handler is called using the target config value passed to it; by default, the "this" is the loader that found the file/dir, but it can be set to anything else by the handler's factory function by setting a `target` property.