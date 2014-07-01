#!/usr/bin/env node

var express = require('express');
var http = require('http')
var path = require('path');
var config = require('./config');

var httpreq = require('httpreq');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var webserver = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

app.get('/*', function (req, res){
	var path = req.params[0];

	var thisRoot = req.protocol + "://" + req.get('host');
	var thisDomain = req.get('host').split(':')[0];

	var targetRoot = config.domainmapping[thisDomain];
	if(!targetRoot) return res.send(thisDomain + ' not found in config.domainmapping');


	var url = targetRoot + path;

	// magic (learned from node-unblocker):
	if(url.match(/\.(jpg|png|svg|js|gif|mp4|ico|swf|styl|jpeg|css)/)){
		return res.redirect(url);
	}

	httpreq.get(url, {
		headers: {
			'user-agent': req.headers['user-agent']
		}
	}, function (err, httpreqRes) {
		if(err) return res.send(err.stack);
		res.send(httpreqRes.body);
	});
});

