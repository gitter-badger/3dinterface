module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.arrows = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'arrows';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
        console.log(err);
    });
}

module.exports.viewports = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'viewports';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
    });
}

module.exports.reverse = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.locals.cameraStyle = 'reverse';

    res.render('prototype.jade', res.locals, function(err, result) {
        res.send(result);
    });
}
