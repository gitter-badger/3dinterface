///<reference path="../../typings/tsd.d.ts" />
///<reference path="../lib/log.ts" />

/**
 * Module dependencies.
 */

import express = require('express');
import fs = require('fs');
var log = require('./log');

function main(app : express.Application) : void {

    log.debug("Loading controllers :");

    fs.readdirSync(__dirname + '/../controllers').forEach(function(name){

        // index.js in controller, with function as pages (views.py for django)
        var obj = require('./../controllers/' + name + '/index');

        // urls.js, just like django urls.py
        var urls = require('./../controllers/' + name + '/urls');
        name = obj.name || name;

        // allow specifying the view engine
        if (obj.engine) app.set('view engine', obj.engine);
        app.set('views', __dirname + '/../controllers/' + name + '/views');

        // generate routes based
        // on the exported methods

        log.debug('   ' + name + ':');

        for (var key in urls) {
            app.get(key, function(req, res) {
                var path = obj[urls[key]](req, res);
                res.render(__dirname + '/../controllers/' + name + '/views/' + path, res.locals, function(err, out) {
                    if (err !== null) {
                    log.jadeerror(err);
                    }
                    res.send(out);
                });
            });
            log.debug('      ' + key + ' -> ' + name + '.' + urls[key]);

        }

        log.debug();

        // mount the app
        // parent.use(app);

    });

}

export = main;
