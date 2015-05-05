var pejs = require('pejs');
views = pejs();

module.exports.index = function(req, res) {
    res.setHeader('Content-Type', 'text/html');

    views.render('bouncing', res.locals, function(err, result) {
        console.log(err);
        res.send(result);
    });
}
