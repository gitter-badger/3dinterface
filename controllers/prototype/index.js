var tools = require('../../lib/filterInt');
var pg = require('pg');
var pgc = require('../../private');
var db = require('./dbrequests');

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

var sceneToFunction = function(scene) {
    switch (scene) {
        case 2:
            return 'L3D.initBobomb';
        case 3:
            return 'L3D.initMountain';
        case 4:
            return 'L3D.initWhomp';
        default:
            return 'L3D.initPeach';
    }
};

module.exports.game = function(req, res) {

    db.tryUser(req.session.userId, function(id) {

        req.session.userId = id;

        db.createExp(id, function(expId, coinCombinationId, sceneId, recommendationStyle, coins) {

            if (expId === undefined) {

                res.redirect('/feedback');
                return;

            }

            req.session.expId = expId;
            req.session.save();

            res.locals.scene = sceneToFunction(sceneId);
            res.locals.recommendationStyle = recommendationStyle;
            res.locals.coins = coins;

            res.setHeader('Content-Type','text/html');
            res.render('prototype_recommendation.jade', res.locals, function(err, result) {
                res.send(result);
            });
        });
    });
};

module.exports.sponza = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('sponza.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

module.exports.replayInfo = function(req, res) {
    res.setHeader('Content-Type', 'text/plain');

    // Parse id
    var id = tools.filterInt(req.params.id);

    db.getInfo(id, function(results) {
        res.send(JSON.stringify(results));
    });
};

module.exports.replay = function(req, res, next) {
    // Get id parameter
    res.locals.id = tools.filterInt(req.params.id);

    db.checkExpId(res.locals.id, function(sceneId) {
        if (sceneId === null) {
            var err = new Error("This replay does not exist");
            err.status = 404;
            next(err);
        } else {
            res.locals.initjs = sceneToFunction(sceneId);
            res.setHeader('Content-Type', 'text/html');
            res.render('prototype_replays.jade', res.locals, function(err, result) {
                res.send(result);
            });
        }
    });
};

module.exports.replayIndex = function(req, res, next) {
    db.getAllExps(function(result) {
        res.locals.users = result;

        res.setHeader('Content-Type', 'text/html');
        res.render("replay_index.jade", res.locals, function(err, result) {
            res.send(result);
        });
    });
};

module.exports.tutorial = function(req, res) {

    db.tryUser(req.session.userId, function(id) {
        req.session.userId = id;

        // 1 is the ID of peach scene
        db.createTutorial(id, function(id, coins) {
            req.session.expId = id;
            res.locals.coins = coins;
            req.session.save();

            res.setHeader('Content-Type', 'text/html');
            res.render('tutorial.jade', res.locals, function(err, result) {
                res.send(result);
            });
        });
    });

};

function editorHelper(templateName) {

    return function(req, res, next) {

        var scene = req.params.scene;

        switch (scene) {

            case 'peach':            res.locals.scene = "L3D.initPeach";    break;
            case 'coolcoolmountain': res.locals.scene = "L3D.initMountain"; break;
            case 'whomp':            res.locals.scene = "L3D.initWhomp";    break;
            case 'bobomb':           res.locals.scene = "L3D.initBobomb";   break;
            default:
                // 404
                var err = new Error('Incorrect scene');
                err.status = 404;
                next(err);
                break;

        }

        res.setHeader('Content-Type', 'text/html');
        res.render(templateName, res.locals, function(err, result) {
            res.send(result);
        });

    };

}

module.exports.clicker = editorHelper('prototype_clicker.jade');
module.exports.viewer = editorHelper('prototype_viewer.jade');
module.exports.checker = editorHelper('prototype_checker.jade');

module.exports.userstudy = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.identificationFailed = req.session.identificationFailed;
    req.session.identificationFailed = false;
    req.session.save();

    res.render('user_study.jade', res.locals, function(err, result) {
        res.send(result);
    });

};
