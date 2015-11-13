var fs = require('fs');
var geo = require('./lib/geo.min.js');

var Log = require('./lib/NodeLog.js');

module.exports = function(io) {
    io.on('connection', function(socket) {

        Log.socket.connection(socket);

        socket.on('disconnect', function() {
            Log.socket.disconnect(socket);
        });

        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });
};
