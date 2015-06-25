/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');

module.exports = function(parent, options){
    var verbose = options.verbose;

    verbose && console.log("Loading controllers :");

    fs.readdirSync(__dirname + '/../posts').forEach(function(name){

        // index.js in controller, with function as pages (views.py for django)
        var obj = require('./../posts/' + name + '/index');

        // urls.js, just like django urls.py
        var urls = require('./../posts/' + name + '/urls');
        var name = obj.name || name;
        var app = express();

        // allow specifying the view engine
        if (obj.engine) app.set('view engine', obj.engine);
        app.set('views', __dirname + '/../posts/' + name + '/views');

        // generate routes based
        // on the exported methods

        verbose && console.log('\t' + name + ':');
        for (var key in urls) {
            app.post(key, obj[urls[key]]);
            verbose && console.log('\t\t' + key + ' -> ' + name + '.' + urls[key]);
        }
        verbose && console.log();

        // mount the app
        parent.use(app);
    });
};
