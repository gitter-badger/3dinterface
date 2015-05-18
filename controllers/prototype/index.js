var pg = require('pg');
var pgc = require('../../private.js');

var createNewId = function() {
    var value;
    pg.connect(pgc.url, function(err, client, release) {
        client.query(
            "INSERT INTO users(name) VALUES('anonymous'); SELECT currval('users_id_seq');",
            [],
            function(err, result) {
                value = result.rows[0].currval;
                release();
                return value;
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
    // req.session.user_id = createNewId();
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'arrows';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.viewports = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'viewports';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.reverse = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'reverse';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
    });
}
