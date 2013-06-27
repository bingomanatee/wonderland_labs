There are a lot of client side frameworks emerging. Most or all of them are sufficiently advanced to use
as the foundation of a professional site. That being said, there are experiential differences between
them that have real implications as to how your app will develop and be maintained.

Herein I will talk about the advantages that different systems provide, and the challenges that
adopting these systems create.

## The contenders

Here are a few libraries that are strong contenders in the space. There are more out there but I'm focusing
on the contenders that I have personally used or at least given strong hands-on evaluation.

* Backbone.js
* Angular.js
* Dojo
* jQuery
* Ember
* Sencha
* Knockout
* Meteor

## The common feature set

There are a variety of useful features in frameworks that almost all of them have in common.
Given that you can be entranced by your first exposure to a given feature in a web framework
its useful to note those that are not valid discriminators:

1. **an event system**. All the frameworks I've seen have an event system that sends messages
    between various components to react to change. Even systems with data binding that do implicit
    change notification have explicit eventing in them as well.
2. **partials**. All web frameworks have the ability to break complex templates up with the use
   of "partials" -- sub-templates for specialized actions, detail, etc.
3. **Interoperation with REST systems**. The ability to take in, render, and update data through
   a REST gateway is standard across all frameworks
4. **Interoperability with jQuery**. All frameworks have the ability to employ jQuery and jQuery UI
   components (datepicker, et. all) as well as most other mainstream libraries (underscore, require, etc.)
5. **Component based architecture**. That is, the ability to package a view template and a javascript file
   into a unified reusable widget.
6. **Targeted Use**. That is the ability to apply themselves to a limited part of the page, allowing
    them to share control of the overall page between multiple applications.
7. **Widget Libraries**. That is, at least a few specialized components for tasks like tabbed panes,
    date pickers, etc.


## Basic Architectural Patterns

There are two basic premises that web frameworks take.

One is **Data Binding**, in which changes to a model dynamically propagate through the visualization.

Another pattern doesn't have a formal name as far as I know -- so I'm calling it **Evented Writing**. In this
system, changes to data are broadcast to components you create, and you are responsible for writing
updated HTML markup to the page.

Lastly, there is the pattern of (my name) **Configured Design**. This pattern leans on a pre-designed set of components
whose creation and maintenance is largely driven by a pre-fabricated set of tools that you assemble into an application.
This pattern resembles the classic "Visual Basic"/"MS Acesss"/"Filemaker" drag and drop UI toolkits. While all frameworks
have these kind of elements here and there, some frameworks are dominated by them, and minimize the amount of pure
coding that is required to produce results.

# Data Binding Frameworks

Data bound frameworks do a superior job of removing the onus of

There are three frameworks strongly in contention in the data binding arena. The links below are to introduction
videos.

* Angular
* Ember
* [Knockout](http://channel9.msdn.com/Events/MIX/MIX11/FRM08)
* Meteor

They all allow you to write interaction patterns directly into templates.

## Angular
I have evaluated Ember, Angular and Knockout and in my experience,
Angular has a much clearer pattern of binding; in Angular all you have to do is declare

<code>
function MyController {
 $scope.user = {name: 'Bob', last: 'Smith'}
 }
 </code>

 with a template

 <code>
 <div ng-controller="MyController">

 <p>Hello {{user.name}} {{user.last}}</p>

 <form>
 <p><label>First Name <input type="text" ng-model="user.name" /></p>
 <p><label>First Name <input type="text" ng-model="user.last" /></p>
 </form>
 </div>
 </code>

And your user names appears and changes as you type in the input fields. Other frameworks require you to translate your
models into specific class instances, or call "ko.bind", or declare and seed model and collection classes as in Backbone.
You can take pure output from AJAX, assign it to a property, and you're done. This makes debugging very easy, as you can
compare your template signature to data structures you can inspect in debuggers/console output.



### Distinctive features

* Well integrated with Twitter Bootstrap. There are sizable projects devoted to Bootstrap/Angular integration
* A variety of ways to bind data into the template. You can, for instance, use pure property/value HTML, or `{{ value }}` notation
* The ability to "pipe" functions to process data as in

<code>
<p>Search for product: <input type="search" ng-model="searchTerm""></p>
<p><label><input type="checkbox" ng-model="descending" /> Most Expensive  ... Least Exepensive</label></p>
<ul>
  <li ng-repaeat="record in products | filter:searchTerm | orderBy:price:descending">{{record.name}} ({{ record.price | dollar }} )</li>
</ul>

</code>

In this example, other than the
