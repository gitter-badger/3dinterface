var fs = require('fs');
var geo = require('./lib/geo.min.js');

var isDev = require('express')().get('env') === 'development';

module.exports = function(io) {
    io.on('connection', function(socket) {

        console.log(
            (isDev ? '\033[33m' : '') +
            '[SOK] ' + new Date() + ' ' + socket.handshake.address + ' connection' +
            (isDev ? '\033[0m' : '')
        );

        socket.on('disconnect', function() {
            console.log(
                (isDev ? '\033[34m' : '') +
                '[SOK] ' + new Date() + ' ' + socket.handshake.address + ' disconnect' +
                (isDev ? '\033[0m' : '')
            );
        });

        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });
};
