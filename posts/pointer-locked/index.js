var pg = require('pg');
var secret = require('../../private');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO pointerlocked(exp_id, locked, time) VALUES($1,$2,to_timestamp($3));",
            [req.session.exp_id, req.body.locked, req.body.time],
            function(err, result) {
                if (err !== null)
                    Log.dberror(err + ' in fps');
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
