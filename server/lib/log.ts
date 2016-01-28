///<reference path="../../typings/tsd.d.ts"/>

import express = require('express');
var http = require('http');

export enum Color {
    DEFAULT,
    BLACK,
    RED,
    GREEN,
    YELLOW,
    BLUE,
    MAGENTA,
    CYAN,
    ORANGE,
}

function getColorCode(c : Color) : string {
    switch (c) {
        case Color.DEFAULT: return '\033[0m';
        case Color.BLACK:   return '\033[30m';
        case Color.RED:     return '\033[31m';
        case Color.GREEN:   return '\033[32m';
        case Color.YELLOW:  return '\033[33m';
        case Color.BLUE:    return '\033[34m';
        case Color.MAGENTA: return '\033[35m';
        case Color.CYAN:    return '\033[36m';
        case Color.ORANGE:  return '\033[38;5;202m';
    }
}

var isDev = require('express')().get('env') === 'development';

var write : (elt : any, color : Color) => void;

if (isDev) {
    write = function(elt : any, color : Color) {
        console.log(getColorCode(color) + elt + getColorCode(Color.DEFAULT));
    }
} else {
    write = function(elt : any, color : Color) {
        console.log(elt);
    }
}

export function ready(msg : any) {
    write('[RDY] ' + new Date() + ' ' + msg, Color.GREEN);
}

export function request(req : express.Request, res : Express.Response, time : number) {

    if (req.headers['x-forwarded-for'] !== undefined || isDev) {

        var isStatic = req.url.substr(0, 7) === '/static' || req.url === '/favicon.ico';

        write(
            '[REQ] ' + new Date() + ' ' +
                (req.headers['x-forwarded-for'] || req.connection.remoteAddress) +
                (time !== undefined ? (' in ' + ("      " + time).slice(-6) + ' ms') : '') +
                ' : ' + (isStatic && req.url !== '/favicon.ico' ? '/static' + req.url : req.url),
            isStatic ? Color.YELLOW : Color.CYAN
        );
    }

}

export module socket {

    export function connection(socket : SocketIO.Socket) {
        write(
            '[SOK] ' + new Date() + ' ' +
                (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address) + ' connection',
            Color.MAGENTA
        );
    }

    export function disconnect(socket : SocketIO.Socket) {
        write(
            '[SOK] ' + new Date() + ' ' +
                (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address) + ' disconnect',
            Color.MAGENTA
        );
    }

}

export function dberror(error : any) {
    write(
        '[DBE] ' + new Date() + ' ' + error,
        Color.RED
    );
}

export function prefetcherror(error : any) {
    write(
        '[PFE] ' + new Date() + ' ' + error,
        Color.RED
    );
}

export function mailerror(error : any) {
    write(
        '[MLE] ' + new Date() + ' ' + error,
        Color.RED
    );
}

export function debug(info? : any, force? : boolean) {
    if (isDev || force === true) {
        write(
            '[DBG] ' + (info !== undefined ? info : ''),
            Color.ORANGE
        );
    }
}

export function jadeerror(error : any) {
    write(
        '[JER] ' + new Date() + ' ' + error,
        Color.RED
    );
}
