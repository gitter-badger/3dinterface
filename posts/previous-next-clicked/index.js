var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;
    var camera = req.body.camera;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO previousnextclicked(user_id, previousnext, time, camera)" +
            "VALUES($1, $2, to_timestamp($3), ROW(ROW($4,$5,$6), ROW($7,$8,$9)));" ,
            [
                user_id,
                req.body.previous ? 'p' : 'n',
                req.body.time,
                camera.position.x,
                camera.position.y,
                camera.position.z,
                camera.target.x,
                camera.target.y,
                camera.target.z
            ],
            function(err, result) {
                release();
            }
        );
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("user_id = " + user_id);

}
