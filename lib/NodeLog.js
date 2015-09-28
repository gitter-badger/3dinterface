var Log = {};

var Colors = Object.freeze({
    DEFAULT: '\033[0m',
    BLACK:   '\033[30m',
    RED:     '\033[31m',
    GREEN:   '\033[32m',
    YELLOW:  '\033[33m',
    BLUE:    '\033[34m',
    MAGENTA: '\033[35m',
    CYAN:    '\033[36m',
    ORANGE:  '\033[38;5;202m',
});

var isDev = require('express')().get('env') === 'development';

var log;

if (isDev) {
    log = function(elt, color) {
        console.log(color + elt + Colors.DEFAULT);
    };
} else {
    log = function(elt, color) {
        console.log(elt);
    };
}

Log.ready = function(msg) {
    log('[RDY] ' + new Date() + ' ' + msg, Colors.GREEN);
};

Log.request = function(req, res, time) {
    if (req.headers['x-forwarded-for'] !== undefined || isDev) {
        log(
            '[REQ] ' + new Date() + ' ' +
                (req.headers['x-forwarded-for'] || req.connection.remoteAddress) +
                (time !== undefined ? (' in ' + ("      " + time).slice(-6) + ' ms') : '') +
                ' : ' + (req.static && req.url !== '/favicon.ico' ? '/static' + req.url : req.url),
            req.static ? Colors.YELLOW : Colors.CYAN
        );
    }
};

Log.socket = {};
Log.socket.connection = function(socket) {
    log(
        '[SOK] ' + new Date() + ' ' +
        (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address) + ' connection',
        Colors.MAGENTA
    );
};

Log.socket.disconnect = function(socket) {
    log(
        '[SOK] ' + new Date() + ' ' +
        (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address) + ' disconnect',
        Colors.MAGENTA
    );
};

Log.dberror = function(error) {
    log(
        '[DBE] ' + new Date() + ' ' + error,
        Colors.RED
    );
};

Log.mailerror = function(error) {
    log(
        '[MLE] ' + new Date() + ' ' + error,
        Colors.RED
    );
};

if (isDev) {
    Log.debug = function(info) {
        log(
            '[DBG] ' + (info !== undefined ? info : ''),
            Colors.ORANGE
        );
    };
} else {
    Log.debug = function(){};
}

module.exports = Log;
