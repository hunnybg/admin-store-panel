var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require("http");
setting_detail = {};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// if (process.env.NODE_ENV == 'production') {
//     var cluster = require('cluster');
//     if (cluster.isMaster) {
//         // Count the machine's CPUs
//         var cpuCount = require('os').cpus().length;

//         // Create a worker for each CPU
//         for (var i = 0; i < cpuCount; i += 1) {
//             cluster.fork();
//         }

// // Code to run if we're in a worker process
//     } else {
//         init();
//     }
// } else {
//     init();
// }

init();

function init() {

	var config = require('./config/config'),
	        mongoose = require('./config/mongoose'),
	        express = require('./config/express'),
	        db = mongoose(),
	        app = express();
	const port = '8000';
	app.listen(port);
	require('events').EventEmitter.prototype._maxListeners = 100;

	var Setting = require('mongoose').model('setting');
	Setting.findOne({}, function (error, setting) {
	    setting_detail = setting
	    console.log(`Server Started on Port ${port} at Date: ${new Date(Date.now())}`); 
	});		
	exports = module.exports = app;
}
