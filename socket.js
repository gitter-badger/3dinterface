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

                /// while (line && line.length === 0) {
                ///     line = lines[++index];
                /// }

                if (!line) {
                    socket.emit('finished');
                    return;
                }

                if (line[0] === 'v') {

                    var arr = line.split(" ");

                    arr[0] = vIndex++;
                    arr[1] = parseFloat(arr[1]);
                    arr[2] = parseFloat(arr[2]);
                    arr[3] = parseFloat(arr[3]);

                    socket.emit('vertex', arr);
                    index++;
                    return;

                } else if (line[0] === 'f') {

                    fIndex++;
                    var arr = line.split(" ");
                    arr.shift();
                    arr[0]--;
                    arr[1]--;
                    arr[2]--;

                    if (arr[3]) {
                        arr[3]--;
                        fIndex++;
                    }

                    socket.emit('face', arr);
                    index++;
                    return;

                }

                socket.emit('none');
                // socket.disconnect();
            });
        });
    });
}
