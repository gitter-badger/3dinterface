var http = require('http');
var express = require('express');
var jade = require('jade');
var pg = require('pg');

// secret variables
var secret = require('./private');

var app = express();
var bodyParser = require('body-parser');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var urls = require('./urls');

app.set('view engine', 'jade');
app.set('trust proxy', 1);

app.use(cookieParser(secret.secret));
app.use(session({
    keys: ['key1', 'key2']
}));

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.locals.title = "3DUI";
    res.locals.urls = urls;
    next();
});

app.use(function(req, res, next) {
    if (req.cookies.alreadyCame) {
        res.locals.alertCookie = false;
    } else {
        res.locals.alertCookie = true;
        res.cookie('alreadyCame', true);
    }
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

app.listen(server_port, server_ip_address);
