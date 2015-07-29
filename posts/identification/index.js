var pg = require('pg');
var secret = require('../../private');
var db = require('../../controllers/prototype/dbrequests.js');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    db.checkUserName(req.body.inputId, function(ok) {
        if (!ok) {
            db.tryUser(req.session.user_id, function(id) {
                req.session.user_id = id;
                req.session.save();

                pg.connect(secret.url, function(err, client, release) {
                    client.query(
                        "UPDATE Users SET worker_id = $1, age = $2, male = $3, rating = $5, lasttime = $6 WHERE id = $4;",
                        [
                            req.body.inputId,
                            req.body.inputAge,
                            req.body.inputGender === 'male',
                            req.session.user_id,
                            req.body.input3dskills,
                            req.body.inputLastTime
                        ],
                        function(err, result) {
                            if (err !== null)
                                Log.dberror(err + ' in identfication');
                            release();
                        }
                    );
                });

                res.redirect('/prototype/tutorial');

            });
        } else {
            req.session.identificationFailed = true;
            res.redirect('/user-study');
        }
    });

};
