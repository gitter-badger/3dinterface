var gulp = require('gulp');
var glob = require('glob').sync;
var touch = require('touch');
var fs = require('fs');
var path = require('path');
var argv = require('yargs').argv;

var changed = path.join(__dirname, '../.changed.json');

var dates = {};

(function() {
    // Create changed file if empty
    var data;
    try {
        data = fs.readFileSync(changed, 'utf-8');
        dates = JSON.parse(fs.readFileSync(changed, 'utf-8'));
    } catch (e) {
        // if (data === undefined) {
        //     console.log('File did not exist, creating it.');
        // } else {
        //     console.log('File existed, but was not parsable : ' + data);
        // }
        fs.writeFileSync(changed, '{}');
    }
})();

function isString(string) {

    return typeof string === 'string' || string instanceof String;

}

module.exports = function(filename) {

    return function(_taskName, _deps, _srcPattern, _callback) {

        var taskName, deps, srcPattern, callback;

        if (!isString(_taskName)) {
            throw new Error('taskName should be a string !');
        }

        // taskName is now correct
        taskName = _taskName;


        if (_deps instanceof Array) {

            // Deps is correct
            deps = _deps;

        } else if (isString(_deps)) {

            // No deps : the string corresponding to srcPattern was given
            deps = [];
            srcPattern = _deps;

        } else {

            throw new Error('Unable to parse arguments');

        }

        if (isString(_srcPattern)) {

            // srcPattern is correct
            srcPattern = _srcPattern;

            if (typeof _callback === 'function') {
                callback = _callback;
            } else {
                callback = function(done) { done(); };
            }

        } else if (typeof _srcPattern === 'function') {

            // We had taskName, pattern, and callback
            callback = _srcPattern;

        } else {

            callback = function(done) { done(); };

        }

        if (!typeof callback === 'function') {
            throw new Error('Callback was not a function');
        }

        // Debug mode
        // console.log('Added task ' + taskName);
        // console.log('\tdeps : ' + (deps.length));
        // console.log('\tsrcPattern : ' + srcPattern);
        // console.log('\tcallback : ' + typeof callback);
        // console.log();

        gulp.task(taskName, deps, function(done) {

            // var dates = JSON.parse(fs.readFileSync(changed, 'utf-8'));
            var lastTimeTaskWasExecuted = dates[taskName];

            var shouldExecuteTask =
                lastTimeTaskWasExecuted === undefined ||
                srcPattern === undefined ||
                lastTimeTaskWasExecuted < getLatestModificationTime(srcPattern) ||
                lastTimeTaskWasExecuted < getLatestModificationTime(filename);

            if (shouldExecuteTask || argv.force || argv.f) {

                // Compile and update date
                console.log(`[\u001b[38;5;238m${new Date().toString().substr(16,8)}\u001b[0m] Doing    '\u001b[36m${taskName}\u001b[0m'`);
                try {
                    callback(function(err) {
                        done.apply(null,arguments);
                        if (err == null) {
                            dates[taskName] = Date.now();
                            fs.writeFileSync(changed, JSON.stringify(dates));
                        }
                    });
                } catch (err) {
                    throw err;
                }

            } else {

                // Nothing to do in that case
                console.log(`[\u001b[38;5;238m${new Date().toString().substr(16,8)}\u001b[0m] Ignoring '\u001b[36m${taskName}\u001b[0m'`);
                done();

            }

        });

    }

};

function getLatestModificationTime(pattern) {

    // Functionnal programming is so beautiful
    return (
        glob(pattern)
            .map((name) => fs.statSync(name).mtime.getTime())
            .reduce((prev, next) => Math.max(prev, next))
   );

};
