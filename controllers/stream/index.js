var tools = require('../../my_modules/filterInt')

module.exports.index = function(req, res, next) {

    // Parse get argument res
    res.locals.resolution = req.params.res;

    if (res.locals.resolution === undefined) {
        res.locals.resolution = 5;
    } else {
        res.locals.resolution = tools.filterInt(res.locals.resolution);
    }

    if (isNaN(res.locals.resolution) || res.locals.resolution < 1 || res.locals.resolution > 25) {
        var error = new Error("Resolution was not set properly");
        error.status = 404;
        next(error);
        return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.render('index.jade', res.locals, function(err, result) {
        console.log(err);
        res.send(result);
    });
}
