module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, out) {
        console.log(err);
        res.send(out);
    });
}
