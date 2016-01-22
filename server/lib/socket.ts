import _ = require('socket.io');

var fs = require('fs');
var geo = require('./geo.min.js');

var log = require('./log.js');

export = function(io : SocketIO.Server) {

    io.on('connection', function(socket : SocketIO.Socket) {

        log.socket.connection(socket);

        socket.on('disconnect', function() {
            log.socket.disconnect(socket);
        });

        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });

};
