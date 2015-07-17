var mail = require('../../lib/mail.js');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    mail.send({
        from: req.body.name + " <dragonrock.django@gmail.com>",
        to:   "Thomas <thomas.forgione@gmail.com>",
        subject: req.body.scene,
        text: JSON.stringify(req.body.coins)
    }, function(err, message) {
        if (err !== null) {
            Log.mailerror(err);
            console.log(err);
        }
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
