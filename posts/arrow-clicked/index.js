var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;
    var arrow_id = req.body.arrow_id;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO arrowclicked(user_id, arrow_id) VALUES($1,$2);",
            [user_id, arrow_id],
            function(err, result) {
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("user_id = " + user_id);

}
