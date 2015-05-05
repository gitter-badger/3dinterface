var pejs = require('pejs');
views = pejs();

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    views.render('index', res.locals, function(err, result) {
        res.send(result);
    });
}
