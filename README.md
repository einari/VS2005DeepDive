# Visual Studio 2015 - Deep Dive - November 2014

Related back to the .connect(); event Microsoft had in November.

# Tasks

* Concat - concatenates all JavaScript files for Features and Directives
* JSHint - Make sure your JavaScript code has the right quality.


# Structure

All features live in the Features folder. Tests, or in this case, Specs (BDD) sits in the Features.Specs folder. 
Look at the Karma configuration for changing this. 


# Angular

## Convention

Instead of working with Angular in a very verbose way with registering everything, you'll find an "angular_conventions" 
task in the Grunt file. It generates a couple of files (routes.js, controllers.js and directives.js) enabling you to drop
in features (View+Controllers) without configuring them. The convention is <name of feature>.html paired with a JS that 
is called the same just with .js as extension. Namespace is vital in this convention - look at the usage of the namespace 
function. Working with larger scale solutions, namespacing is vital - or scoping that is. There are many ways of doing this,
this is a very explicit way.

## Directives

All directives are in the Directives folder. The convention says that the folder name becomes the name of the directive - 
lower cased. Within a directive the HTML file should be called View.html and the Controller called Controller.js. 
You could easily add support for Links.

# SignalR

The sample is pumped with SignalR - one hub; AccountsHub. There is also a hookup for Angular with this that gives you the
ability to take a dependency on a Hub directly in the controller and the connection lifecycle is managed, so one does not
have to do .start() on the connection. This is centralized in the hubsSetup.js. It also wraps the hubs in new wrapper 
proxies enabling lazily responding to events in the hub. There is a slight change with this, instead of the .done() 
promise mechanism that SignalR normally uses, the promise type that is returned is the actual Promise.js type you'll find
in this project, it does not have .done() but rather .continueWith(). 
