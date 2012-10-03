## Frankenstien's layout

This layout is a merger of HTML5 boilerplate and Twitter Bootstrap.
Some css herein (main, normalize) from HTML boilerplate are not used as I'm not too motivated to reconcile these
css styles with the boostrap css.

Note: both the sidebar ad the top navigation only appear if their dependant data have been set.
Default side navigation has been set up as view helpers within the ne_bootstrap layout but
should probably be edited to reflect your site.

Also if activity prior to rendering initializes the sidebar, nav, and/or hero data, these helpers leave that data
as it is, so you can override menus and navbars within an action.