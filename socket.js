var fs = require('fs');
var sleep = require('sleep');
var geo = require('./geo/MeshStreamer.js');

module.exports = function(io) {
    io.on('connection', function(socket) {

        var streamer = new geo.MeshStreamer();

        streamer.start(socket);

    });
}
