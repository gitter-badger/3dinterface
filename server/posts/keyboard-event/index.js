var pg = require('pg');
var secret = require('../../private');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO keyboardevent(exp_id, camera, time, keycode, keypressed)" +
            "VALUES($1, ROW(ROW($2,$3,$4),ROW($5,$6,$7)), to_timestamp($8), $9, $10);" ,
            [
                req.session.expId,
                req.body.camera.position.x,
                req.body.camera.position.y,
                req.body.camera.position.z,

                req.body.camera.target.x,
                req.body.camera.target.y,
                req.body.camera.target.z,

                req.body.time,

                req.body.keycode,
                req.body.keypressed
            ],
            function(err, result) {
                if (err !== null)
                    Log.dberror(err + ' in keyboard-event');
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
