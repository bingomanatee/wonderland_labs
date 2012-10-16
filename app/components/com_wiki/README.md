# Nuby Express Wiki

Nuby Express Wiki is based on Github-style markdown. Though it is based on wiki organization,
it is usable as a general purpose article base.

## Article Organization

Each article is organized around a "Scope" - a namespace within which each article name is unique.
Beyond that there is no other system of organization - no parent/child system et.all., though a tag
system is in the works.

## Markdown and Custom Filters

Article parsing is done by the marked javascript library -- https://github.com/chjj/marked. However
it can be enhanced with custom functions, through extension of the script action.

Currently there are two custom filters that act on top of (and after) the transforms in marked:

1. The wikilink filter transforms article links in the form [[name]] or [[name:label]] to hyperlinks to articles.
   This filter only addresses links inside a given scope.

2. The scope menu filter transforms the tag <scope_menu>scope name</scope_menu> to a link list of all the
   articles in the wiki. If your wiki grows too big for such a list to be useful, customize the scope_menu
   action to be more selective.

Note that to some extent standard HTML can be embedded within the text if you need specific layout that cannot
be accomplished with markdown.