var tools = require('../../my_modules/filterInt.js');
var pg = require('pg');
var pgc = require('../../private.js');

var createNewId = function(req, res, callback) {
    pg.connect(pgc.url, function(err, client, release) {
        client.query(
            "INSERT INTO users(name) VALUES('anonymous'); SELECT currval('users_id_seq');",
            [],
            function(err, result) {
                req.session.user_id = result.rows[0].currval;
                req.session.save();
                callback();
                release();
            }
        );
    });
}

var checkId = function(req, res, next, callback, id) {
    pg.connect(pgc.url, function(err, client, release) {
        client.query(
            "SELECT id FROM users WHERE id = $1",
            [id],
            function(err, result) {
                if (result.rows.length > 0) {
                    callback();
                } else {
                    var error = new Error("Id not found");
                    error.status = 404;
                    next(error);
                }
                release();
            }
        );
    });
}

var getPathFromId = function(req, res, callback, id) {
    pg.connect(pgc.url, function(err, client, release) {
        client.query(
            "SELECT ((camera).position).x AS px, " +
                   "((camera).position).y AS py, " +
                   "((camera).position).z AS pz, " +
                   "((camera).target).x   AS tx, " +
                   "((camera).target).y   AS ty, " +
                   "((camera).target).z   AS tz " +
            "FROM keyboardevent WHERE user_id = $1;",
            [id],
            function(err, result) {
                res.locals.path = [];
                for (var i in result.rows) {
                    res.locals.path.push(
                        {
                            position : {
                                x: result.rows[i].px,
                                y: result.rows[i].py,
                                z: result.rows[i].pz
                            },
                            target : {
                                x: result.rows[i].tx,
                                y: result.rows[i].ty,
                                z: result.rows[i].tz
                            }
                        }
                    );
                }
                callback();
                release();
            }
        );
    });
}

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.arrows = function(req, res) {
    createNewId(req, res, function() {
        res.setHeader('Content-Type', 'text/html');

        res.locals.cameraStyle = 'arrows';

        res.render('prototype.jade', res.locals, function(err, result) {
            res.send(result);
        });
    });
}

module.exports.viewports = function(req, res) {
    createNewId(req, res, function() {
        res.setHeader('Content-Type', 'text/html');

        res.locals.cameraStyle = 'viewports';

        res.render('prototype.jade', res.locals, function(err, result) {
            res.send(result);
        });
    });
}

module.exports.reverse = function(req, res) {
    createNewId(req, res, function() {
        res.setHeader('Content-Type', 'text/html');

        res.locals.cameraStyle = 'reverse';

        res.render('prototype.jade', res.locals, function(err, result) {
            res.send(result);
        });
    });
}

module.exports.replay_info = function(req, res) {
    res.setHeader('Content-Type', 'text/plain');

    // Parse id
    var id = tools.filterInt(req.params.id);

    getPathFromId(req, res, function() {
        res.send(JSON.stringify(res.locals.path));
    }, id);
}

module.exports.replay = function(req, res, next) {
    res.locals.id = tools.filterInt(req.params.id);
    checkId(req,res, next, function() {
        res.setHeader('Content-Type', 'text/html');
        res.locals.cameraStyle = "replay";
        res.render('prototype.jade', res.locals, function(err, result) {
            res.send(result);
        });
    }, res.locals.id);

}
