var fs = require('fs');
var sleep = require('sleep');
var geo = require('./geo/Mesh.js');

module.exports = function(io) {
    io.on('connection', function(socket) {

        var index = 0;
        var vIndex = 0;
        var fIndex = 0;
        var mesh;

        // console.log(socket.conn.remoteAddress + " connected !");

        // socket.on('disconnect', function() {
        //     console.log(socket.conn.remoteAddress + " disconnected !");
        // });

        socket.on("request", function(path) {
            // console.log('Asking for static/data/spheres/' + res + '.obj');

            var regex = /.*\.\..*/;

            if (regex.test(path)) {
                socket.emit('error');
                socket.disconnect();
            }

            mesh = new geo.MeshStreamer(path, function() {
                socket.emit('ok');

                // console.log("Display mesh !");
                // for (var i = 0; i < mesh.orderedElements.length; i++) {
                //     console.log(mesh.orderedElements[i].toString());
                // }

                // var counter = 0;
                // for (var i = 0; i < mesh.orderedElements.length; i++) {
                //     if (mesh.orderedElements[i] instanceof geo.Usemtl) {
                //         counter++;
                //     }
                // }
                // console.log(counter);

            });

        });

        socket.on('next', function() {

            var bound = 100;
            var toSend = [];
            var elt;

            for (var limit = mesh.index + bound; mesh.index < limit; mesh.index++) {

                elt = mesh.orderedElements[mesh.index];

                if (elt) {
                    elt.sent = true;
                    toSend.push(elt.toList());
                } else {
                    break;
                }

            }

            socket.emit('elements', toSend);

            if (!elt) {
                socket.disconnect();
            }

        });
    });
}
