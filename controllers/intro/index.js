module.exports.index = function(req, res) {

    req.session.workerId = req.params.workerId;
    req.session.save();

    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

