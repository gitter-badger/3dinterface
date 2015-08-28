var pg = require('pg');
var secret = require('../../private');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO previousnextclicked(exp_id, previousnext, time, camera)" +
            "VALUES($1, $2, to_timestamp($3), ROW(ROW($4,$5,$6), ROW($7,$8,$9)));" ,
            [
                req.session.expId,
                req.body.previous ? 'p' : 'n',
                req.body.time,
                req.body.camera.position.x,
                req.body.camera.position.y,
                req.body.camera.position.z,
                req.body.camera.target.x,
                req.body.camera.target.y,
                req.body.camera.target.z
            ],
            function(err, result) {
                if (err !== null)
                    Log.dberror(err + ' in previousnext');
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");

};
