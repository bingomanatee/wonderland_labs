Hive Component is a class designed to streamline and facilitate a common class-pattern set in Node. 

Hive Component is a function that accepts two arguments: 

1. an object(or array of objects) that are mixed in to the component
2. an object (or array of objects, or a string that is a file path to a JSON file) that populates the _config property of the component. 

The reason for this duality is to separate the namespace of the "data" registry of the component from the namespace of the functions. Although the mixins don't HAVE to be functional, it is encouraged to minimize the number of property fields that are included in the mixins. 

## Initializing a Component

In some situations you may have a set of actions that you want to do to initialize your configuration. As the constructor is shared across all components you have to define custom initialization done through a special set of functions stored in the `init_tasks` configuration property. 

These tasks are called with async waterfall, with the component set as the context (this). These functions have a single argument, a `callback` to be executed when the task is done. 

Calling `object.init([callback?])` calls these method in series.

Depending on the nature of the init_tasks, you may or may not be able to call init_tasks inline. 

## Example

Say you wanted to create a node-mailer wrapper in Hive-Component. 

``` javaScript

var _ = require('underscore');
var util = require('util');
var nodemailer = require("nodemailer");
var Component = require('hive-component');

/* ************************************
 *  a wrapper for nodemailer
 * ************************************ */

/* ********* EXPORTS ******** */

module.exports = function (params) {

	var mixins = {
		smtpTransport: function () {
			var transport = this.get_config('transport') || "SMTP";
			var service = this.get_config('service');
			var user = this.get_config('user');
			var pass = this.get_config('pass');

			return nodemailer.createTransport(transport, {
				service: service,
				auth:    {
					user: user,
					pass: pass
				}
			});
		},

		send: function(options, callback){
			options = _.pick( _.extend(this.config().valueOf(), (options || {})),
				'from', 'to', 'subject', 'text', 'html');
			console.log('options: %s', util.inspect(options));
			this.smtpTransport().sendMail(options, callback);
		}
	};

	var configs = {
		init_tasks: [
			function(done){
				if (!this.has_config('from') && this.has_config('user')){
					var user = this.get_config('user');

					if (/.*@.*/.test(user)){
						this.set_config('from', user);
					}
					done();
				}
			}

		]
	};

	var mail_comp = Component(mixins, [params, configs]);

	mail_comp.init();

	return mail_comp;
}; // end export function

```

Usage would then look like this:

``` javascript

tap.test('send mail', function (t) {

	var mailer = sample_mailer({
		transport: 'SMTP',
		service:   'Gmail',
		user:      'poppin.fressh@gmail.com',
		pass:      '0ligarch!'
	});

	mailer.send({
		to:      'bingomanatee@me.com',
		subject: 'This is a test mail',
		text:    'this mail has a body',
		html:    'this mail has an HTML body'
	}, function (error, response) {
		if (error) {
			console.log(error);
			t.error(error);
			t.end();
		} else {
			console.log("Message sent: " + response.message);
			t.ok(/ OK /.test(response.message));
			t.end();
		}
	})

})

```