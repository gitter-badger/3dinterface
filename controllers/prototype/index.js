var tools = require('../../lib/filterInt');
var pg = require('pg');
var pgc = require('../../private');
var db = require('./dbrequests');

// Shuffle array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function randomArray() {
    var arr = [];
    for (var i = 2; i < 5; i++) {
        arr.push(i);
    }
    arr = shuffle(arr);
    return arr;
}


function randomReco() {
    var recoStyles = [
        'prototype_empty.jade',
        'prototype_viewports.jade',
        'prototype_arrows.jade'
    ];

    return shuffle(recoStyles);

}

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

var generateSceneNumber = function(req, res) {
    if (req.session.scenes !== undefined) {
        req.session.currentSceneIndex++;
    } else {
        req.session.scenes = randomArray();
        req.session.currentSceneIndex = 0;
    }

    return req.session.scenes[req.session.currentSceneIndex];
};

var generateRecommendationStyle = function(req, res) {

    if (req.session.recos === undefined) {
        req.session.recos = randomReco();
    }

    return req.session.recos.shift();
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

    db.tryUser(req.session.user_id, function(id) {

        var scene = generateSceneNumber(req, res);
        res.locals.scene = sceneToFunction(scene);
        res.locals.recommendationStyle = 'L3D.ArrowRecommendation';
        req.session.user_id = id;

        db.createExp(id, function(expId, coinCombinationId, sceneId, recommendationStyle, coins) {

            if (expId === undefined) {

                res.redirect('/feedback');
                return;

            }

            req.session.exp_id = expId;
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

module.exports.replay_info = function(req, res) {
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

    db.checkExpId(res.locals.id, function(scene_id) {
        if (scene_id === null) {
            var err = new Error("This replay does not exist");
            err.status = 404;
            next(err);
        } else {
            res.locals.initjs = sceneToFunction(scene_id);
            res.setHeader('Content-Type', 'text/html');
            res.render('prototype_replays.jade', res.locals, function(err, result) {
                res.send(result);
            });
        }
    });
};

module.exports.replay_index = function(req, res, next) {
    db.getAllExps(function(result) {
        res.locals.users = result;

        res.setHeader('Content-Type', 'text/html');
        res.render("replay_index.jade", res.locals, function(err, result) {
            res.send(result);
        });
    });
};

module.exports.tutorial = function(req, res) {

    db.tryUser(req.session.user_id, function(id) {
        req.session.user_id = id;

        // 1 is the ID of peach scene
        db.createTutorial(id, function(id) {
            req.session.exp_id = id;
            req.session.save();

            res.setHeader('Content-Type', 'text/html');
            res.render('tutorial.jade', res.locals, function(err, result) {
                res.send(result);
            });
        });
    });

};

module.exports.clicker = function(req, res, next) {

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
    res.render('prototype_clicker.jade', res.locals, function(err, result) {
        res.send(result);
    });

};

module.exports.viewer = function(req, res, next) {

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
    res.render('prototype_viewer.jade', res.locals, function(err, result) {
        res.send(result);
    });

};

module.exports.userstudy = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.identificationFailed = req.session.identificationFailed;
    req.session.identificationFailed = false;
    req.session.save();

    res.render('user_study.jade', res.locals, function(err, result) {
        res.send(result);
    });

};
