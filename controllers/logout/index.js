module.exports.index = function(req, res) {

    req.session = null;
    res.locals.session = null;
    res.redirect('/');

};
