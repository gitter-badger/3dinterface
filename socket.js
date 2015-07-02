var fs = require('fs');
var geo = require('./lib/geo.min.js');

module.exports = function(io) {
    io.on('connection', function(socket) {

        console.log('[SOK] ' + new Date() + ' ' + socket.handshake.address + ' connection');

        socket.on('disconnect', function() {
            console.log('[SOK] ' + new Date() + ' ' + socket.handshake.address + ' disconnect');
        });

        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });
};
