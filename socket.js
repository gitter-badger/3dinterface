var fs = require('fs');
var sleep = require('sleep');

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
        var path;
        var vIndex = 0;
        var fIndex = 0;

        // console.log(socket.conn.remoteAddress + " connected !");

        // socket.on('disconnect', function() {
        //     console.log(socket.conn.remoteAddress + " disconnected !");
        // });

        socket.on("request", function(res) {
            // console.log('Asking for static/data/spheres/' + res + '.obj');

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
                        toSend.push(parseLine(line));
                        line = lines[++index];
                    }

                    if (line && line[0] === 'f') {
                        toSend.push(parseLine(line));
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
