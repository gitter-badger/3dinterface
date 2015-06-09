var fs = require('fs');
var sleep = require('sleep');

module.exports = function(io) {
    io.on('connection', function(socket) {
        console.log(socket + " connected !");

        socket.on('disconnect', function() {
            console.log(socket + " disconnected !");
        });

        socket.on("request", function(res) {
            console.log('Asking for static/data/spheres/' + res + '.obj');

            fs.readFile('static/data/spheres/' + res + '.obj.obj', function(err, data) {
                var lines = data.toString('utf-8').split("\n");
                var vIndex = 0;
                var fIndex = 0;
                for (i = 0, iMax = lines.length; i < iMax; i++ ) {
                    if (lines[i][0] === 'v') {
                        var arr = lines[i].split(" ");
                        arr[0] = vIndex++;
                        arr[1] = parseFloat(arr[1]);
                        arr[2] = parseFloat(arr[2]);
                        arr[3] = parseFloat(arr[3]);
                        // (function (arr) {
                        //     setTimeout(function() {
                                socket.emit('vertex', arr);
                        //     }, i);
                        // })(arr);
                    } else if (lines[i][0] === 'f') {
                        fIndex++;
                        var arr = lines[i].split(" ");
                        arr.shift();
                        arr[0]--;
                        arr[1]--;
                        arr[2]--;

                        if (arr[3]) {
                            arr[3]--;
                            fIndex++;
                        }

                        // (function (arr) {
                        //     setTimeout(function() {
                                socket.emit('face', arr);
                        //     },i);
                        // })(arr);

                    }
                }
                socket.emit('finished', fIndex);
                // socket.disconnect();
            });
        });
    });
}
