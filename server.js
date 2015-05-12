var http = require('http');
var express = require('express');
var jade = require('jade');

var app = express();
var urls = require('./urls');

app.set('view engine', 'jade');

app.use(function(req, res, next) {
    res.locals.title = "3DUI";
    res.locals.urls = urls;
    next();
});

// Load controllers
require('./lib/boot')(app, { verbose: !module.parent });

app.use('/static', express.static('static'));

// When error raised
app.use(function(err, req, res, next) {
    if (err.status === 404) {
        res.setHeader('Content-Type', 'text/html');

        res.render('404.jade', res.locals, function(err, result) {
            res.send(result);
        });
    }
});

// When route not found, raise not found
app.use(function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('404.jade', res.locals, function(err, result) {
        res.send(result);
    });
});

// Set ports and ip address
var server_port, server_ip_address;
if ( app.get('env') === 'development' ) {
    server_port = 4000;
    server_ip_address = 'localhost';
} else {
    // Openhift conf
    server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
}

console.log("Starting server on " + server_ip_address + ":" + server_port);
app.listen(server_port, server_ip_address);
