# NOOGLE

Noogle indexes the Node.js IRC chats in elasticsearch for digestion.

Currently the auto-initialization of elasticsearch does not appear to work -
you have to manually crank up the elasticsearch
in the vendors directory before you start your app.

This module is also dependant on MongoDB to maintain the list of archive files.

Noogle is heavily alpha - it does not for instance have mechanisms for updating the index files selectively.

Also the more recent posts are heavily favored, as they are relevant to the more recent releases.

Information is indexed by version, so in the future if you want info relevant to a specific version/version range
of node.js you can use that as a search criteria.

Time (local time) is also a searchable field.