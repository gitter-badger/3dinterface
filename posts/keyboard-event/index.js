var pg = require('pg');
var secret = require('../../private');

module.exports.index = function(req, res) {

    var user_id = req.session.user_id;
    var camera = req.body.camera;

    pg.connect(secret.url, function(err, client, release) {
        client.query(
            "INSERT INTO keyboardevent(user_id, direction, camera)" +
                    "VALUES($1, NULL, ROW(ROW($2,$3,$4),ROW($5,$6,$7)));" ,
            [
                user_id,
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
