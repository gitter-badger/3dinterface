var db = require('../prototype/dbrequests.js');
var vcode = require('../../lib/vcode.js');

module.exports.index = function(req, res) {

    // If not micro-worker
    if (req.session.workerId === undefined) {

        res.setHeader('Content-Type', 'text/html');

        res.send(null);

        return;
    }

    // Else, check that exp was correctly done
    db.getUser(req.session.userId, function(workerId, ok) {

        res.setHeader('Content-Type', 'text/html');

        if (ok === true) {

            var code = vcode(req.session.workerId);
            res.send(code);

        } else if (ok === false) {

            res.send('no vcode');

        } else {

            res.send('not ready');

        }

    });

};

