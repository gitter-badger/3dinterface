module.exports = function(app, urls) {
    app.get(urls.index, function(req, res) {
        res.setHeader('Content-Type', 'text/html');

        views.render('index', res.locals, function(err, result) {
            console.log(err);
            res.send(result);
        });
    });
}
