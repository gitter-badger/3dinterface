/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var Log = require('./NodeLog.js');

module.exports = function(parent){

    Log.debug("Loading controllers :");

    fs.readdirSync(__dirname + '/../controllers').forEach(function(name){

        // index.js in controller, with function as pages (views.py for django)
        var obj = require('./../controllers/' + name + '/index');

        // urls.js, just like django urls.py
        var urls = require('./../controllers/' + name + '/urls');
        name = obj.name || name;
        var app = express();

        // allow specifying the view engine
        if (obj.engine) app.set('view engine', obj.engine);
        app.set('views', __dirname + '/../controllers/' + name + '/views');

        // generate routes based
        // on the exported methods

        Log.debug('   ' + name + ':');

        for (var key in urls) {
            app.get(key, obj[urls[key]]);

            Log.debug('      ' + key + ' -> ' + name + '.' + urls[key]);

        }

        Log.debug();

        // mount the app
        parent.use(app);
    });
};
