var db = require('../prototype/dbrequests.js');

module.exports.index = function(req, res) {
    db.verifyUser(req.session.userId, function() {});

    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

