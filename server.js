var http = require('http');
var express = require('express');
var jade = require('jade');
var pg = require('pg');

var favicon = require('serve-favicon');

// secret variables
var secret = require('./private');

var app = express();

// Socket.io initialization
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./socket.js')(io);

var bodyParser = require('body-parser');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var urls = require('./urls');

var isDev = app.get('env') === 'development';

app.set('view engine', 'jade');
app.set('trust proxy', 1);

app.use(cookieParser(secret.secret));
app.use(session({
    keys: [secret.secret]
}));

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {

    // Log connection
    console.log(
        '[REQ] ' + new Date() + ' ' +
        (req.headers['x-forwarded-for'] || req.connection.remoteAddress) +
        ' : ' + req.url
    );

    res.locals.title = "3DUI";
    res.locals.urls = urls;
    res.locals.session = req.session;
    next();
});

// Set a cookie to know if already came. If not, France laws force to
// warn the user that the website uses cookies.
app.use(function(req, res, next) {
    if (req.cookies.alreadyCame) {
        res.locals.alertCookie = false;
    } else {
        res.locals.alertCookie = true;
        res.cookie('alreadyCame', true, {maxAge: 604800000}); // One week in ms
    }
    next();
});

// app.use(function(req, res, next) {
//     console.log(req.session.user_id);
//     next();
// });

// Load controllers
require('./lib/controllers')(app, { verbose: isDev });

// Load post to log data from user study
require('./lib/posts')(app, { verbose: isDev });

// Static files
app.use('/static', express.static('static'));

// Favicon
app.use(favicon(__dirname + '/static/ico/favicon.ico'));

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
if ( isDev ) {
    server_port = 4000;
    server_ip_address = 'localhost';
} else {
    // Openhift conf
    server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
}

// Start server
http.listen(server_port, server_ip_address, function() {
    console.log("[READY] Now listening " + server_ip_address + ":" + server_port);
});
