The script sequence for an action is more involved than the typical MVC action. This is because effort is made to mitigate the "callback pyramid of doom" by extracting the elements of a callback sequence into a consistent tier of activity. 

The methods in an action script that are called, in sequence, are 

* on_validate(context, done)
* on_input(context, done)
* on_process(context, done)
* on_output(context, done)

Defining overrides in your action script for these methods is optional; any or all of them can be left as a default (empty) pipe. 

The "done" callback function must be called at some point for each of your actions' methods. 

The intended semantics for these methods is as follows:

## on_validate

This method is used to validate that all required fields from the input of the request are present and are in the acceptable format/range. It also allows you do do ACL checks on the logged-in member for the downstream actions. 

## on_input

This method is for extracting input from the request, the file system and/or one or more models as needed. Some further validation may be done here based on the found data. 

## on_process

This method is for interpreting, writing and saving data to the file system, models, etc. Anything that changes state should go here. 

## on_output

Any final preparation of content for the benefit of the template goes here.