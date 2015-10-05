var pg = require('pg');
var pgc = require('../../private.js');
var db = require('../../controllers/prototype/dbrequests.js');
var mail = require('../../lib/mail.js');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    db.verifyUser(req.session.userId, function() {});

    var text = '';

    for (var i in req.body) {
        text += i + ' : ' + req.body[i] + '\n';
    }


    pg.connect(pgc.url, function(err, client, release) {

        client.query(
            'SELECT Users.worker_id AS name FROM Users WHERE Users.id = $1;',
            [req.session.userId],

            function(err, result) {
                mail.send({
                    from: result.rows[0].name + " <" + req.session.userId + "@toto.tata>",
                    to:   "Thomas <dragonrock.django@gmail.com>",
                    subject:  "By " + result.rows[0].name,
                    text: text
                }, function(err, message) {
                    if (err !== null) {
                        Log.mailerror(err);
                    }
                });

            }
        );

    });

    res.redirect('/thankyou');

};
