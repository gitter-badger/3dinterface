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

var addCamerasFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT ((camera).position).x AS px, " +
            "((camera).position).y AS py, " +
            "((camera).position).z AS pz, " +
            "((camera).target).x   AS tx, " +
            "((camera).target).y   AS ty, " +
            "((camera).target).z   AS tz, " +
            "time                  AS time " +
            "FROM keyboardevent WHERE user_id = $1 ORDER BY time;",
        [id],
        function(err, result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: 'camera',
                        position : {
                            x: result.rows[i].px,
                            y: result.rows[i].py,
                            z: result.rows[i].pz
                        },
                        target : {
                            x: result.rows[i].tx,
                            y: result.rows[i].ty,
                            z: result.rows[i].tz
                        },
                        time: result.rows[i].time
                    }
                );
            }
            callback();
        }
    );
}

var addCoinsFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT coin_id, time FROM coinclicked WHERE user_id = $1",
        [id],
        function(err,result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: 'coin',
                        time: result.rows[i].time,
                        id: result.rows[i].coin_id
                    }
                );
            }
            callback();
        }
    );
}

var addArrowsFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT arrow_id, time FROM arrowclicked WHERE user_id = $1",
        [id],
        function(err, result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: 'arrow',
                        time: result.rows[i].time,
                        id: result.rows[i].arrow_id
                    }
                );
            }
            callback();
        }
    );
}

var addResetsFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT time FROM resetclicked WHERE user_id = $1",
        [id],
        function(err, result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: 'reset',
                        time: result.rows[i].time
                    }
                );
            }
            callback();
        }
    );
}

var addPreviousNextFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT ((camera).position).x AS px, " +
            "((camera).position).y AS py, " +
            "((camera).position).z AS pz, " +
            "((camera).target).x   AS tx, " +
            "((camera).target).y   AS ty, " +
            "((camera).target).z   AS tz, " +
            "time                  AS time " +
            "FROM previousnextclicked;",
        [],
        function(err, result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: 'previousnext',
                        time: result.rows[i].time,
                        previous: result.rows[i].previousnext == 'p',
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
        }
    );
}

var addHoveredFromId = function(client, req, res, callback, id) {
    client.query(
        "SELECT start, time, arrow_id FROM hovered WHERE id = $1",
        [id],
        function(err, result) {
            res.locals.path = res.locals.path || [];
            for (var i in result.rows) {
                res.locals.path.push(
                    {
                        type: "hovered",
                        time: result.rows[i].time,
                        start: result.rows[i].start,
                        id: result.rows[i].arrow_id
                    }
                );
            }
            callback();
        }
    );
}

var getAllUsers = function(req, res, callback) {
    pg.connect(pgc.url, function(err, client, release) {
        client.query(
            "SELECT id, name FROM users;",
            [],
            function(err, result) {
                res.locals.ids = result.rows;
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

    pg.connect(pgc.url, function(err, client, release) {
        addCamerasFromId(client, req, res, function() {
            addCoinsFromId(client, req, res, function() {
                addArrowsFromId(client, req, res, function() {
                    addResetsFromId(client, req, res, function() {
                        addPreviousNextFromId(client, req, res, function() {
                            addHoveredFromId(client, req, res, function() {
                                res.locals.path.sort(function(elt1, elt2) {
                                    // Dates as string can be compared
                                    if (elt1.time < elt2.time)
                                        return -1;
                                    if (elt1.time > elt2.time)
                                        return 1;
                                    return 0;
                                });
                                res.send(JSON.stringify(res.locals.path));
                            }, id);
                        }, id);
                    }, id);
                }, id);
            }, id);
        }, id);
        release();
    });
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

module.exports.replay_index = function(req, res, next) {
    getAllUsers(req, res, function() {
        res.render("replay_index.jade", res.locals, function(err, result) {
            res.send(result);
        });
    });
}
