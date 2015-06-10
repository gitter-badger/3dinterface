var fs = require('fs');
var sleep = require('sleep');

module.exports = function(io) {
    io.on('connection', function(socket) {

        var index = 0;
        var path;
        var vIndex = 0;
        var fIndex = 0;

        console.log(socket.conn.remoteAddress + " connected !");

        socket.on('disconnect', function() {
            console.log(socket.conn.remoteAddress + " disconnected !");
        });

        socket.on("request", function(res) {
            console.log('Asking for static/data/spheres/' + res + '.obj');

            path = 'static/data/spheres/' + res + '.obj.obj';

            socket.emit('ok');

        });

        socket.on('next', function() {

            fs.readFile(path, function(err, data) {
                var lines = data.toString('utf-8').split("\n");
                var line = lines[index];
                var toSend = [];

                for (var i = 0; i < 50; i++) {
                    while (line && line[0] !== 'f') {
                        toSend.push(line);
                        line = lines[++index];
                    }

                    if (line && line[0] === 'f') {
                        toSend.push(line);
                        line = lines[++index];
                    }
                }
                if (!line) {
                    socket.emit('finished');
                }

                socket.emit('elements', toSend);

            });
        });
    });
}
