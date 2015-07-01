module.exports.index = function(req, res) {
    req.session = null;
    res.locals.session = null;
    res.setHeader('Content-Type', 'text/html');

    res.render('../../index/views/index.jade', res.locals, function(err, out) {
        res.send(out);
    });
};
