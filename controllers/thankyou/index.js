var db = require('../prototype/dbrequests.js');
var vcode = require('../../lib/vcode.js');

module.exports.index = function(req, res) {

    db.verifyUser(req.session.userId, function(ok) {

        if (ok) {

            res.locals.vcode = vcode(req.session.workerId, req.session.campaignIp);

        }

        res.locals.workerId = req.session.workerId;
        req.session = null;
        res.locals.session = null;

        res.setHeader('Content-Type', 'text/html');

        res.render('index.jade', res.locals, function(err, result) {
            console.log(err);
            res.send(result);
        });

    });

};

