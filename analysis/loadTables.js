var pg = require('pg');
var async = require('async');
var DBReq = require('./dbrequests.js');

var users, client, release, scenes, coinCombinations, experiments, callback, url, db = {};

function write(str) {
    process.stderr.write('\033[31m' + str + '\033[0m');
}

function start() {

    client = new pg.Client(url);

    write("Connecting to the database...");
    client.connect(
        function() {
            write(" done !\n");
            client.query(
                'SELECT * FROM Users WHERE valid',
                function(err, result) {
                    users = result.rows;
                    main();
                }
            );
        }
    );

}

function main() {
    async.series([

        // Init
        function(done) {

            write("Getting scenes and coin combinations...");

            async.parallel([
                function(callback) {
                    client.query(
                        'SELECT * FROM Scene;',
                        [],
                        function(err, result) {
                            scenes = result.rows;
                            callback();
                        }
                    );
                },

                function(callback) {

                    client.query(
                        'SELECT * FROM CoinCombination;',
                        function(err, result) {
                            coinCombinations = result.rows;
                            callback();
                        }
                    );

                },

                function(callback) {

                    client.query(
                        'SELECT * FROM Experiment WHERE finished;',
                        function(err, result) {
                            experiments = result.rows;
                            callback();
                        }
                    );

                },

            ], function() {
                write(" done !\n");
                done();
            });

        },

        function(done) {

            write("Getting experiments for each user...");
            async.each(
                users,
                function(user, callback) {
                    client.query(
                        'SELECT * FROM Experiment WHERE user_id = $1 AND finished',
                        [user.id],
                        function(err, result) {
                            user.experiments = result.rows;
                            callback();
                        }
                    );
                },
                function(err, result) {
                    write(' done !\n');
                    done();
                }
            );
        },

        function(done) {

            write('Getting experiments...');

            async.each(
                experiments,
                function(exp, callback) {
                    client.query(
                        'SELECT user_id, coin_combination_id FROM Experiment WHERE id = $1',
                        [exp.id],
                        function(err, result) {
                            exp.coinCombination = coinCombinations[result.rows[0].coin_combination_id - 1];
                            exp.user = users[result.rows[0].user_id - 1];
                            callback();
                        }
                    );
                },
                function() {
                    write(' done !\n');
                    done();
                }
            );

        },

        function(done) {

            write('Getting interactions from experiments (might be long)');

            async.each( // Don't know why each doesn't work
                experiments,
                function(exp, callback) {
                    DBReq.getInfo(exp.id, function(result) {
                        write('.');
                        exp.elements = result;
                        callback();
                    });
                },
                function () {
                    write(' done !\n');
                    done();
                }
            );

        },

        // Finish
        function(done) {
            client.end();

            done();
        },

        function(done) {

            db.users = users;
            db.experiments = experiments;
            db.coinCombinations = coinCombinations;
            callback(db);
            done();

        }

    ]);

}

module.exports = function(_url, _callback) {
    callback = _callback;
    url = _url;
    start();
    return module.exports;
};


