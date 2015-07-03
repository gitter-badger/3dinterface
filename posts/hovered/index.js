var pg = require('pg');
var secret = require('../../private');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO hovered(exp_id, time, start, arrow_id)" +
            "VALUES($1, to_timestamp($2), $3, $4);" ,
            [
                req.session.exp_id,
                req.body.time,
                req.body.start ? true : false,
                req.body.arrow_id
            ],
            function(err, result) {
                if (err !== null)
                    Log.dberror(err);
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
