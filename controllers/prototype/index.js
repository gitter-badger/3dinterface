var express = require('express')
var pejs = require('pejs');

app = express();
views = pejs();

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    views.render('prototype', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.arrows = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.extrajs = '<script src="/static/js/prototype/arrows/main.js"></script>';

    views.render('prototype/prototype', res.locals, function(err, result) {
        console.log(err);
        res.send(result);
    });
}

module.exports.viewports = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.extrajs = '<script src="/static/js/prototype/viewports/main.js"></script>';

    views.render('prototype/prototype', res.locals, function(err, result) {
        res.send(result);
    });
}
