Actions are at the core of Hive. Traditionally actions have been methods of a long, winding controller. In Hive, each action is a discrete folder with a ?[script](action_scripts) file, (optionally) its own ?[static file collection](static_files), its own configuration file (with routing definitions), and potentially, any other ?[resources](resources) that are specific to the action.

Actions are organized by the folder structure, within ?[Hives](hives) and indirectly, the Hives' ?[Frame](frames). 

As much effort has been made to provide the ability to centralize all action-specific files in the actions' folder. 

A typical action folder is structured as follows: 

``` bash

/frames/frame_foo/hives/bar/actions
  vey/
    static
      js
       vey_script.js
    vey_action.js
    vey_view.html
    vey_config.json
```

## Configuration file

The `vey_config.json` file contains the configuration for the action. this includes (but is not limited to) the following properties:

<dl>
<dt>routes</dt>
<dd>an object with one or more of the following properties: 'get','put','post','delete'. The value for these properties are string values, or arrays of strings, in the Express routing pattern: '/foo/bar/vey/:name/:value'. There are no rules (beyond those of the Express parser) for how the routes are structured, other than that they be globally unique. </dd>
<dt>name</dt>
<dd>Optional if for some reason you want to name the action something other than the name of its containing folder. Action names need not be unique -- they are indexed by the path to their folder. </dd>
<dt>static</dt>
<dd>the mapping of the ?[static files](static_files) in the static folder.
</dl>

note that ALL of this information is optional, except the routes -- you should have at least one route for an action.