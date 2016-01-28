import express = require('express');

export function index(req : express.Request, res : express.Response) {

    res.setHeader('Content-Type', 'text/html');
    return 'index.jade';

}
