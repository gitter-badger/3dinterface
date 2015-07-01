/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');

module.exports = function(parent, options){
    var verbose = options.verbose;

    if (verbose)
        console.log("Loading controllers :");

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

        if (verbose)
            console.log('\t' + name + ':');

        for (var key in urls) {
            app.get(key, obj[urls[key]]);

            if (verbose)
                console.log('\t\t' + key + ' -> ' + name + '.' + urls[key]);

        }

        if (verbose)
            console.log();

        // mount the app
        parent.use(app);
    });
};
