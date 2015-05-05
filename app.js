var http = require('http');
var express = require('express');
var pejs = require('pejs');
var module = require('./my_modules/filterInt');

var app = express();
var views = pejs();

var urls = require('./urls');

app.set('view engine', 'pejs');

app.use(function(req, res, next) {
    res.locals.title = "3DUI";
    res.locals.urls = urls;
    next();
});

// Load controllers
require('./lib/boot')(app, { verbose: !module.parent });

app.use('/static', express.static('static'));

app.use(function(err, req, res, next) {
    if (err.status === 404) {
        res.setHeader('Content-Type', 'text/html');

        views.render('404', res.locals, function(err, result) {
            res.send(result);
        });
    }
});

app.use(function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    views.render('404', res.locals, function(err, result) {
        res.send(result);
    });
});

app.listen(4000);
