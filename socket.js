var fs = require('fs');
var geo = require('./geo/MeshStreamer.js');

module.exports = function(io) {
    io.on('connection', function(socket) {

        console.log("New MeshStreamer");
        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });
}
