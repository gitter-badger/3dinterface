var fs = require('fs');
var sleep = require('sleep');
var geo = require('./geo/Mesh.js');

function parseLine(line) {
    var elts = line.split(' ');
    if (elts[0] === 'v') {

        return [
            'v',
            parseFloat(elts[1]),
            parseFloat(elts[2]),
            parseFloat(elts[3])
        ];

    } else if (elts[0] === 'f') {

        var tmp = [
            'f',
            parseInt(elts[1]) - 1,
            parseInt(elts[2]) - 1,
            parseInt(elts[3]) - 1
        ];

        if (elts[4]) {
            tmp.push(parseInt(elts[4]) - 1);
        }

        return tmp;
    }
}

module.exports = function(io) {
    io.on('connection', function(socket) {

        var index = 0;
        var vIndex = 0;
        var fIndex = 0;
        var mesh;

        // console.log(socket.conn.remoteAddress + " connected !");

        socket.on('disconnect', function() {
            console.log(socket.conn.remoteAddress + " disconnected !");
        });

        socket.on("request", function(res) {
            // console.log('Asking for static/data/spheres/' + res + '.obj');

            var path = 'static/data/spheres/' + res + '.obj';

            mesh = new geo.MeshStreamer(path, function() {
                socket.emit('ok');
            });
        });

        socket.on('next', function() {
            var toSend = [];
            var elt;

            for (var limit = mesh.index + 200; mesh.index < limit; mesh.index++) {

                elt = mesh.orderedElements[mesh.index];

                if (elt) {
                    elt.sent = true;
                    toSend.push(elt.toList());
                } else {
                    break;
                }

            }

            console.log(toSend.length);
            socket.emit('elements', toSend);

            if (!elt) {
                socket.disconnect();
            }

        });
    });
}
