--------
?[Request Flow](request_flow)
--------

Hive MVC is a robust, scalable Node site framework. It is designed around switchable building blocks including 

* view pipes 
* self contained action folders with their own collection of static/client side files
* a file/folder based system that distributes route and script configuration by a series of granular files 
* Action scripts that are designed for testability with or without an HTTP connection
* Phase-based action scripts that partition execution to minimize callback confustion
* A series of independent support modules for memory resident models,, boostrap/loading and scaffolding
* the ability to localize static/client side files near the actions that use them rather than splaying all the static
 resources in a single folder

Built on Express, and designed to integrate with existing Express.js sites, Hive MVC brings the organizational concepts of mature frameworks like Zend and Ruby to the extensible and accessible style of Node applications.

## Why Another Web Framework?

Express -- as far as it goes -- is adequate for projets up to a certain scale. However as projects increase to the scale of a production website, managing resources for its components, routes, and static files becomes extremely troublesome as the manifest of each url endpoint becomes scattered in type-centric storage. 

### Centralizing resources around solutions

Hive MVC is designed to allow for both central organization of actions, and distribution of responsibility through functional files. There is no reason for the script for a given action to be stored in one bin and its template to be scattered elsewhere, with the static files relevant to the action (images, client side javascript) in yet another folder. 

Also, there has not been a substantial effort to group the server and client side resources about a given action into a singe package. 

### Splitting actions into tiers of functionality

The callback centric nature of Node solutions begs for a more organized tier of methods; having a single function for an action is disingenuous when any dynamic activity within node nests at least two or three functions in tiers. 

It reduces the complexity of tiered callbacks becomes more manageable when you have semantically distinct pipes to work within. Having specific tiers to code within,

* Validation
* Input (from database, files, and request)
* Processing (output from request to database, and file)
* Output (any final cleanup necessary to prepare data for request)

allows for callbacks to be better organized into semantically distinct tiers.