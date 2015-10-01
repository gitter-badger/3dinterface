var pg = require('pg');
var secret = require('../../private');
var db = require('../../controllers/prototype/dbrequests.js');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    var workerId = req.session.workerId || req.body.inputId;

    db.checkUserName(workerId, function(ok) {
        if (!ok) {

            db.createUser(
                workerId,
                req.body.inputAge,
                req.body.inputGender === 'male',
                req.body.input3dskills,
                req.body.inputLastTime,
                function(id) {
                    req.session.userId = id;
                    req.session.save();
                    res.redirect('/prototype/tutorial');
                }
            );

        } else {
            req.session.identificationFailed = true;
            res.redirect('/user-study');
        }
    });

};
