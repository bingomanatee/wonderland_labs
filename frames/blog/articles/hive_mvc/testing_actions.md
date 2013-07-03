Actions are designed to be piped through with or without an active HTTP connection. 

Testing Actions is relatively easy, even in the unit testing context:

1. create an apiary and have it parse your frame. 

2. Call apiary.init() and put your test in the callback *

3. Create a context, passing the action as a parameter. The API requires a request and response object, but naked objects are acceptable in most contexts. 
  * You need to assign a method ('get', 'post') to the request object
  * If session activity is involved, you will need to attach a `session` object to the request. 

4. call context.resolve and put the rest of your test in the callback. 

5. examine the state of context.$out for the state of the variables. 

One word of warning -- the view helpers do NOT kick in at this point. They will be downstream
of the respond() call. If you want to actually test a view helper, see below.

#### Example: testing an Action

the following test is a Mocha test of a JSON service action. 

``` javascript

		before(function (done) {
			apiary = mvc.Apiary({}, Constants.FRAMES_ROOT);

			HOLDINGS = _.sortBy(HOLDINGS, 'id');

			/*  !!!!! GENERIC STEP ONE !!!!! bootstrap your apiary */
			apiary.init(function () {
				transModel = apiary.model('holdings');
				//	console.log('apiary root: %s', util.inspect(apiary.get_config('root')));
				actionModel = apiary.model('$actions');
				
				/* !!!!! GENERIC STEP TWO !!!!!! extract a named action based on its relative path */
				
				getHoldingsAction = actionModel.get('/api/hives/invest/actions/getHoldings');

				done();
			});
		});
		
		it('should return the holdings by user account id', function (done) {
		
			/* !!!! GENERIC STEP THREE !!!! create a context with your action as a parameter
			   note the easily faked request, response parameters */
			   
			   	var context = apiary.Context({
				method: 'post',
				url:    '/api/invest/getHoldings'
			}, {}, getHoldingsAction);
			
			context.userAccountIds = '[334909]';

			/* !!!! GENERIC STEP FOUR !!!!! call context.respond. */
			
			getHoldingsAction.respond(context, function () {
			
				/* !!!!!!! GENERIC STEP FIVE !!!!! test the $out property of context. 
				*/
						
				/**
				  * context out has a JSON structure
				  * {spData: { holdings: [{holding} ... {holding} ] } }
				  **/
				  
				var spData = context.$out.get('spData');
				
				/** reducing the many fields returned by the API to only the fields we care about */
				
				var tickers = _.sortBy(_.map(spData.holdings, function (h) {
					return {ticker: h.ticker, amount: h.amount, userAccountId: h.userAccountId}
				}), 'id');
				
				tickers.length.should.eql(48);

				/* extracting a specific set of records from our expectation data */
				
				var holdingsFor334909 = _.filter(HOLDINGS, function(h){
					return h.userAccountId == 334909
				})

				/* comparing the found records to the expected records */
				_.each(tickers, function (t, i) {
					if (t.ticker) t.ticker.should.eql(holdingsFor334909[i].ticker, 'testing ticker ' + i);
					if (t.id) t.id.should.eql(holdingsFor334909[i].id, 'testing ticker ' + i);
					if (t.userAccountId) t.userAccountId.should.eql(holdingsFor334909[i].userAccountId, 'testing uaid ' + i);
				})
				done();
			});
		});

```

#### Example 2: testing a Model

Sometimes the actions aren't what you want to test. Here is a test of a mongoose/hive-mongoose based model.

The Apiary is initiated to get the model and any related helpers queued. then the model method of apiary is used to retrieve the model.

In many test scenarios you'll want to mock or stub out a model. But if testing model interaction is what
you need to do, here is one use case of that. 

Using Mongo/Mongoose/Hive-model-mongoose, you can create a test server on the fly as long as you drop it at the end of the test. **

Note that this test shows how you can load only a single frame when initializing your Apiary. 

When using hive-model-mongoose based models, you'll have to inject the mongoose instance
into the apiary itself as a config property. 

In this scenario, the mongo database is being polled. No external oauth sources are actually
being hit - just the saved oauth data that they (theoretically) return. 

``` javascript

	tap.test('test auth model', function (t) {

		var rand_number = Math.round(Math.random() * 10000000);
		var name = 'wll_model_test_' + rand_number;
		console.log('created database ..... %s', name);
		mongoose.connect('mongodb://localhost/' + name, function () {

			var apiary = mvc.Apiary({mongoose: mongoose}, path.resolve(__dirname, '../../'));

			apiary.init(function () {
				var member_model = apiary.model('member');

				/**
				 * validate that the record errors out without a provider ID
				 */
				member_model.get_from_oauth(dave_facebook_id, function (err, members) {

					t.equal(err.message, 'oauth must have provider', 'error for provider missing');

					var dfbid_typed = clone(dave_facebook_id);
					dfbid_typed.provider = 'facebook';

					/**
					 * validate that the record is not found.
					 */
					member_model.get_from_oauth(dfbid_typed, function (err, members) {

						t.ok(_.isNull(err), 'has no error');
						t.ok(_.isArray(members), 'member is an array');
						t.equal(members.length, 0, 'has no members');

						/**
						 * add the record - validate its fields
						 */
						member_model.add_from_oauth(dfbid_typed, function (err2, members2, multiple2) {

							console.log('err: %s, members: %s, mult: %s', err2, util.inspect(members2), multiple2);

							setTimeout(function () {

								t.ok(_.isNull(err2), 'has no error');
								t.ok(_.isArray(members2), 'member is an array');
								t.equal(members2.length, 1, 'has one member');
								var member = members2[0];
								var oauth = member.oauthProfiles[0];

								t.equal(oauth.displayName, 'Dave Edelhart', 'oauth displayName');
								t.equal(oauth.name.familyName, 'Edelhart', 'oauth familyName');
								t.equal(oauth._id, '805008941', 'oauth id');

								/**
								 * get the record again - validate that the record is now in the DB.
								 */
								member_model.get_from_oauth(dfbid_typed, function (err3, members3) {

									t.ok(_.isNull(err3), 'has no error');
									t.ok(_.isArray(members3), 'member is an array');
									t.equal(members3.length, 1, 'has one member');
									/*	var member = members3[0];
									 var oauth = member.oauthProfiles[0];

									 t.equal(oauth.displayName, 'Dave Edelhart', 'oauth displayName');
									 t.equal(oauth.name.familyName, 'Edelhart', 'oauth familyName');
									 t.equal(oauth._id, '805008941', 'oauth id'); */

									mongoose.connection.db.dropDatabase(function (err) {
										console.log('database %s dropped, err = %s', name, err);
										mongoose.disconnect(function () {
											t.end();
										})
									});
								}, 300);
							})
						})

					})
				})
			});
		});

	}); 

```

#### Example 3: testing a `view_helper`

Here we are testing a view helper. As before, an apiary is being created and initialized. 
Here, a specific frame ensures that it is the only frame loaded. 

The tests here are concerned with the message behavior; this is "flash message" management. 
The view helper is polled from apiary's internal resource database. 

note that the message frame has a mixin that actually __adds a method__ to all contexts, 
`add_message`. 

the view_helper's `respond` method is then manually called. This helper adds a
`.helpers.has_message` and `.helpers.messages()` method to the output of an action. 

In this case the action is a generic action that we spawn off of `apiary.Action()`; it
has no internal scripts and is simply an empty pipe. 

The following is a tap test; note that the test is internal to the callback of `apiary.init()`.

``` javascript
			
tap.test('test messages', function (t) {

	var apiary = mvc.Apiary({}, path.resolve(__dirname, '../../'));
	apiary.set_config('frame_filter', ['hive_messages']);
	
	/* ********* This ensures that only the `hive_messages` frame 
	   is loaded in the next step: *****/
	   
	apiary.init(function () {
		/* Extract a named view helper from the apiary's Resource database. */
	
		apiary.Resource.list.find({TYPE: 'view_helper', name: 'message_view_helper'}).one(
			function (err, view_helper) {
		
			/* ******* HERE IS WHERE THE TESTS BEGIN ********** */

				var action_stub = apiary.Action({}, {});
				var context = apiary.Context({session: {}, method: 'get'}, {}, action_stub);
				context.add_message('a message', 'info');

				t.deepEqual(context.$session('messages'), [
					{
						"text": "a message",
						"key":  "info"
					}
				], 'messages in storage');

				action_stub.respond(context, function (err, out) {
					var out = context.$out.valueOf();
					
					/* ********** CALLING THE view_helper **********
					   internally, all `view_helper`'s `respond` method are called
					   in between an action's respons and the processing of an 
					    action's template.
					*/
					
					view_helper.respond(context, out, function () {

						t.ok(out.helpers.has_messages(), 'helper has messages');
						var messages = out.helpers.messages();
						/* messages returns a grouped list of all message, by type. */
						t.deepEqual(messages, {info: ['a message']}, 'messages are ordered');
						t.ok(!out.helpers.has_messages(), ' helper no longer has messages');
						t.end();
					});
				});
			})
				
		});
}); 

```

* * * * * *

 &ast; (or the "done" callback if you are using a "before" type test structure.)

 &ast;&ast; You do run the risk of leaving "junk databases" behind after a failed test but those
 are relatively easy to find and kill with an external script.