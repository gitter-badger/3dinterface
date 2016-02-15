var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var argv =
    require('yargs').option('w', {
        alias: "watch",
        default:process.argv.map((o) => o === 'dev').reduce((a,b) => a || b, false)
    }).argv;
var exec = require('child_process').exec;

fs.readdirSync(path.join(__dirname, 'tasks')).forEach(function(name) {

    require(path.join(__dirname, 'tasks', name));

});

gulp.task('dev', function(done) {

    process.chdir('build/server');
    exec('nodemon server.js', done)
        .stdout.on('data', (lines) => {
            for (var data of lines.toString().split('\n')) {
                if (data.length > 1)
                    process.stdout.write(`[\u001b[38;5;238m${new Date().toString().substr(16,8)}\u001b[0m] ` + data + '\n');
            }
        });

});

