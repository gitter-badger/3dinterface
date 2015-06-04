var tools = require('../../my_modules/filterInt');
var pg = require('pg');
var pgc = require('../../private');
var db = require('./dbrequests');

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

var protoHelper = function(template) {
    return function(req, res) {
        db.tryUser(req.session.user_id, function(id) {
            db.createExp(id, function(id) {
                req.session.exp_id = id;
                req.session.user_id = id;
                req.session.save();

                res.setHeader('Content-Type','text/html');
                res.render(template, res.locals, function(err, result) {
                    res.send(result);
                });
            });
        });
    };
}

module.exports.arrows = protoHelper('prototype_arrows.jade');
module.exports.viewports = protoHelper('prototype_viewports.jade');
module.exports.reverse = protoHelper('prototype_reverse.jade');

module.exports.replay_info = function(req, res) {
    res.setHeader('Content-Type', 'text/plain');

    // Parse id
    var id = tools.filterInt(req.params.id);

    db.getInfo(id, function(results) {
        res.send(JSON.stringify(results));
    });
}

module.exports.replay = function(req, res, next) {
    // Get id parameter
    res.locals.id = tools.filterInt(req.params.id);

    db.checkExpId(res.locals.id, function(idExist) {
        if (!idExist) {
            var err = new Error("This replay does not exist");
            err.status = 404;
            next(err);
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.render('prototype_replays.jade', res.locals, function(err, result) {
                res.send(result);
            });
        }
    });
}

module.exports.replay_index = function(req, res, next) {
    db.getAllExps(function(result) {
        res.locals.users = result;

        res.setHeader('Content-Type', 'text/html');
        res.render("replay_index.jade", res.locals, function(err, result) {
            res.send(result);
        });
    });
}

module.exports.tutorial = function(req, res) {


    res.setHeader('Content-Type', 'text/html');
    res.render('tutorial.jade', res.lcals, function(err, result) {
        res.send(result);
    });
}
