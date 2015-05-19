var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;
    var coin_id = req.body.coin_id;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO coinclicked(user_id, coin_id) VALUES($1,$2);",
            [user_id, coin_id],
            function(err, result) {
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("user_id = " + user_id);

}
