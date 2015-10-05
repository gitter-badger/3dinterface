var db = require('../prototype/dbrequests.js');
var vcode = require('../../lib/vcode.js');

module.exports.index = function(req, res) {

    // If not micro-worker
    if (req.session.workerId === undefined) {

        res.setHead('Content-Type', 'text/html');

        res.render('normal.jade', res.locals, function(err, result) {
            res.send(result);
        });

        return;
    }

    res.setHeader('Content-Type', 'text/html');

    res.render('vcode.jade', res.locals, function(err, result) {
        console.log(err);
        res.send(result);
    });

};

