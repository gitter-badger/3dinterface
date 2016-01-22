import express = require('express');

export function index(req : express.Request, res : express.Response) {

    console.log("ok");

    res.setHeader('Content-Type', 'text/html');

    res.render('index.jade', res.locals, function(err : Error, out : string) {
        console.log(err);
        res.send(out);
    });
}
