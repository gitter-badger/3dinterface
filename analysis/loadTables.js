var pg = require('pg');
var async = require('async');

var users, client, release, scenes, coinCombinations, experiments, callback, url;

function start() {

    client = new pg.Client(url);

    client.connect(
        function() {
            client.query(
                'SELECT * FROM Users',
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
                        'SELECT * FROM Experiment;',
                        function(err, result) {
                            experiments = result.rows;
                            callback();
                        }
                    );

                },

            ], function() {
                done();
            });

        },

        function(done) {
            async.map(
                users,
                function(user, callback) {
                    client.query(
                        'SELECT * FROM Experiment WHERE user_id = $1',
                        [user.id],
                        function(err, result) {
                            user.experiments = result.rows;
                            callback();
                        }
                    );
                },
                function(err, result) {
                    done();
                }
            );
        },

        function(done) {

            async.map(
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
                done
            );

        },

        // Finish
        function(done) {
            client.end();

            console.log("Finished");

            done();
        },

        function(done) {

            module.exports.users = users;
            module.exports.experiments = experiments;
            module.exports.coinCombinations = coinCombinations;
            callback();
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


