import express = require('express');

export function index(req : express.Request, res : express.Response) {
    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err, result) {
        console.log(err);
        res.send(result);
    });
};
