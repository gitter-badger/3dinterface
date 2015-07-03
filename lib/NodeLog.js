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
});

var isDev = require('express')().get('env') === 'development';

var log;

if (isDev) {
    log = function(elt, color) {
        console.log(color + elt + Colors.DEFAULT);
    }
} else {
    log = function(elt, color) {
        console.log(elt);
    }
}

Log.ready = function(msg) {
    log('[RDY] ' + new Date() + ' ' + msg, Colors.GREEN);
}

Log.request = function(req, res) {
    log(
        '[REQ] ' + new Date() + ' ' +
        (req.headers['x-forwarded-for'] || req.connection.remoteAddress) +
        ' : ' + req.url,
        Colors.CYAN
    );
}

Log.socket = {};
Log.socket.connection = function(socket) {
    log(
        '[SOK] ' + new Date() + ' ' +
        socket.handshake.address + ' connection',
        Colors.YELLOW
    );
}

Log.socket.disconnect = function(socket) {
    log(
        '[SOK] ' + new Date() + ' ' +
        socket.handshake.address + ' disconnect',
        Colors.YELLOW
    );
}

Log.dberror = function(error) {
    log(
        '[DBE] ' + new Date() + ' ' + error,
        Colors.RED
    );
}

module.exports = Log;
