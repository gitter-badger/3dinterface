var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO fpscounter(exp_id, fps) VALUES($1,$2);",
            [req.session.exp_id, req.body.fps],
            function(err, result) {
                if (err !== null)
                    console.log("[DBERROR] " + err);
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
