var http = require('http');
var express = require('express');
var module = require('./my_modules/filterInt');
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

app.use(function(err, req, res, next) {
    if (err.status === 404) {
        res.setHeader('Content-Type', 'text/html');

        res.render('404.jade', res.locals, function(err, result) {
            res.send(result);
        });
    }
});

app.use(function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('404.jade', res.locals, function(err, result) {
        res.send(result);
    });
});

app.listen(4000);
