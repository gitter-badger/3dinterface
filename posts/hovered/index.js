var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO hovered(user_id, time, start, arrow_id)" +
            "VALUES($1, to_timestamp($2), $3, $4);" ,
            [
                user_id,
                req.body.time,
                req.body.start ? true : false,
                req.body.arrow_id
            ],
            function(err, result) {
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("user_id = " + user_id);

}
