/*jslint node: true, nomen: true, unparam: true*/
"use strict";
var DEBUG = false;

//Load dependencies 
//var util = require("util");
//var Q = require("q");

var express = require('express'),
app = express();
app.use(express.static('www'));
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});



//Starts the mongoDB database server (connects to MongoLab)
/*var events;
var mongo = require('mongodb');
var collection;
var db;	

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://heroku_app28519549:49i1cotckj8dqicpv7mpikrlm7@ds061199.mongolab.com:61199/heroku_app28519549';

mongo.Db.connect(mongoUri, function (err, db) {
	 events = db.collection('events');
});
*/

//app.listen(process.env.PORT || 3000);
//console.log('Web Server listening on port ' + port + '...');
//console.log('You can now open the following URL in your webbrowser: http://localhost:' + port + '/');


