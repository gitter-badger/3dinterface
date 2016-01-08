module.exports.demoConfig = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    res.render('demo-config.jade', res.locals, function(err, result) {
        res.send(result);
    });

};

module.exports.demo = function(req, res) {

    res.setHeader('Content-Type', 'text/html');

    switch (req.query.scene) {
        case '2': res.locals.scene = 'BobombScene'; break;
        case '3': res.locals.scene = 'MountainScene'; break;
        case '4': res.locals.scene = 'WhompScene'; break;
    }

    switch (req.query.bookmark) {
        case '0': res.locals.bookmark = 'L3D.BaseRecommendation'; break;
        case '1': res.locals.bookmark = 'L3D.ViewportRecommendation'; break;
        case '2': res.locals.bookmark = 'L3D.ArrowRecommendation'; break;
    }

    res.locals.prefetch = req.query.prefetch;

    res.render('demo.jade', res.locals, function(err, result) {
        res.send(result);
    });
};

