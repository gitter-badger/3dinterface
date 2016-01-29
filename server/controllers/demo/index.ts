import express = require('express');

export function demoConfig(req : express.Request, res : express.Response, render : Function) {

    res.setHeader('Content-Type', 'text/html');
    render('demo-config.jade');

};

export function demo(req : express.Request, res : express.Response, render : Function) {

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

    render('demo.jade');
};

