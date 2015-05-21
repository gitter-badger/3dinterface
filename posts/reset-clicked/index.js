var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;
    var camera = req.body.camera;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO resetclicked(user_id, time)" +
            "VALUES($1, to_timestamp($2));" ,
            [
                user_id,
                req.body.time
            ],
            function(err, result) {
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("user_id = " + user_id);

}
