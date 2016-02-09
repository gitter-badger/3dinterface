// enable source map
import sourceMapSupport = require('source-map-support');
sourceMapSupport.install();

import express = require('express');
import jade = require('jade');
import pg = require('pg');
import r_io = require('socket.io');
import http = require('http');
import r_sock = require('./lib/socket');
import path = require('path');

function main() {

    let app = express();
    let http = require('http').Server(app);
    let io = r_io(http);
    let log = require('./lib/log');
    r_sock(io);

    let bodyParser = require('body-parser');
    let session = require('cookie-session');
    let cookieParser = require('cookie-parser');

    let isDev = app.get('env') === 'development';

    app.set('view engine', 'jade');
    app.set('trust proxy', 1);

    let secret = require('./private');
    app.use(cookieParser(secret.secret));
    app.use(session({keys:[secret.secret]}));

    // Log request and time to answer
    app.use(function(req : express.Request, res : express.Response, next : Function) {
        let start = Date.now();
        res.on('finish', function() {
            log.request(req, res, Date.now() - start);
        });
        res.locals.title = "3DUI";
        res.locals.urls = require('./urls');
        next();
    });

    app.use(function(req, res, next) {
        if (req.cookies.alreadyCame) {
            res.locals.alertCookie = false;
        } else {
            res.locals.alertCookie = true;
            res.cookie('alreadyCame', true, {maxAge: 604800000});
        }
        next();
    });

    // Load controllers
    require('./lib/controllers')(app);

    // Static files
    app.use('/static', express.static('./static/'));

    // Favicon
    app.use(require('serve-favicon')(path.join(__dirname, 'static/ico/favicon.ico')));

    // When route not found, raise not found
    app.use(function(req, res) {
        res.setHeader('Content-Type', 'text/html');

        res.render('404.jade', res.locals, function(err, result) {
            if (err)
                console.log(err);
            res.send(result);
        });
    });

    // Set ports and ip address
    let serverPort : number, serverIpAddress : string;
    if ( isDev ) {
        serverPort = 4000;
        serverIpAddress = '0.0.0.0';
    } else {
        // Openhift conf
        serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8080;
        serverIpAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
    }

    http.listen(serverPort, serverIpAddress, function() {
        log.ready('Now listening ' + serverIpAddress + ':' + serverPort);
    });
}

if (require.main === module) {
    main();
}
