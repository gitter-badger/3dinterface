var mail = require('../../lib/mail.js');
var Log = require('../../lib/NodeLog.js');

module.exports.index = function(req, res) {

    var text = '';

    for (var i in req.body) {
        text += i + ' : ' + req.body[i] + '\n'
    }

    mail.send({
        from: req.session.user_id + " <" + req.session.user_id + "@toto.tata>",
        to:   "Thomas <thomas.forgione@gmail.com>",
        subject:  "By " + req.session.user_id,
        text: text
    }, function(err, message) {
        if (err !== null) {
            Log.mailerror(err);
        }
    });

    res.redirect('/thankyou');

};
