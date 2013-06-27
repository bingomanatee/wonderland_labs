/**
 * Module dependencies.
 */

var express = require('express')
	, http = require('http')
	, path = require('path')
	, util = require('util')
	, mvc = require('hive-mvc')
	, passport = require('passport')
	, mongoose = require('mongoose');

var app = express();
var PORT = 80;

app.configure(function () {
	app.set('port', PORT);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('html', require('ejs').renderFile);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('fuzzy little pizzas'));
	app.use(express.session());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function () {
	//app.use(express.errorHandler());
});

server = http.createServer(app);
server.on('close', function () {
	console.log('======== closing server');
});

server.listen(app.get('port'), function () {
	mongoose.connect('mongodb://localhost/wll');
	var apiary = mvc.Apiary({mongoose: mongoose}, __dirname + '/frames');
	apiary._config.setAll(require('./site_identity.json'));
	apiary._config.setAll(require('./passport_config.json'));
	apiary.set_config('god_mode', true);
	console.log('initializing apiary for port %s', PORT);
	apiary.init(function () {
		console.log('serving');
		apiary.serve(app, server);
	});
});
