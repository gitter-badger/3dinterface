var pg = require('pg');
var pgc = require('../../private.js');
var Log = require('../../lib/NodeLog.js');

/**
 *
 * @namespace
 */
var DBReq = {};

/**
 * A class that loads every information from an experiment
 * @param id {Number} id of the experiment to load
 * @param finishAction {function} callback on the result when loading is
 * finished
 * @memberof DBReq
 * @constructor
 *
 */
DBReq.Info = function(id, finishAction) {

    /**
     * Id of the experiment to log
     * @type {Number}
     */
    this.id = id;

    /**
     * Map between each element to load and a boolean saying if the element has
     * been already loaded
     * @type {Object}
     */
    this.ready = {
        cameras: false,
        coins: false,
        arrows: false,
        resets : false,
        previousNext: false,
        hovered: false,
        pointerLocked: false,
        switchedLockOption: false,
        redCoins: false
    };

    /**
     * List of the ids of the coins involved in the experiment
     * @type {Number[]}
     */
    this.redCoins = [];

    /**
     * Container of the result
     * @type {Object}
     */
    this.results = {};

    /**
     * Callback to call on finalResult when the loading is complete
     * @type {function}
     */
    this.finishAction = finishAction;

    /**
     * Client of connection to database
     */
    this.client = null;

    /**
     * Function that releases the client to database
     * @type {function}
     */
    this.release = null;

    // Connect to db
    var self = this;
    self.client = new pg.Client(pgc.url);

    self.client.connect(function() {
        self.execute();
    });
};

/**
 * Loads everything async
 */
DBReq.Info.prototype.execute = function() {
    this.loadCameras();
    this.loadCoins();
    this.loadArrows();
    this.loadResets();
    this.loadPreviousNext();
    this.loadHovered();
    this.loadSwitchedLockOption();
    this.loadPointerLocked();
    this.loadRedCoins();
};

/**
 * Checks if everything is loaded, and if so merges the results and call the
 * final callback
 */
DBReq.Info.prototype.tryMerge = function() {
    // If not ready, do nothing
    for (var i in this.ready) {
        if (!this.ready[i]) {
            return;
        }
    }

    // Release db connection
    // this.release();
    // this.release = null;
    this.client.end();
    this.client = null;

    this.merge();
    this.finishAction(this.finalResult);
};

/**
 * Merges the results of the different SQL requests and prepare final result.
 */
DBReq.Info.prototype.merge = function() {

    var i = 0;

    this.finalResult = {redCoins : [], events : []};

    for (;;) {
        // Find next element
        var nextIndex = null;

        for (i in this.results) {
            // The next element is placed at the index 0 (since the elements
            // gotten from the database are sorted)
            if (this.results[i].length !== 0 &&
                (nextIndex === null || this.results[i][0].time < this.results[nextIndex][0].time)) {
                nextIndex = i;
            }
        }

        // If there is no next element, we're done
        if (nextIndex === null) {
            break;
        }

        // Add the next element in results and shift its table
        this.finalResult.events.push(this.results[nextIndex].shift());
    }

    // Set red coins
    for (i = 0; i < this.redCoins.length; i++) {
        this.finalResult.redCoins.push(this.redCoins[i]);
    }
};

/**
 * Launches the SQL request to load the camera information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadCameras = function() {
    var self = this;
    this.client.query(
        "SELECT ((camera).position).x AS px, " +
            "((camera).position).y AS py, " +
            "((camera).position).z AS pz, " +
            "((camera).target).x   AS tx, " +
            "((camera).target).y   AS ty, " +
            "((camera).target).z   AS tz, " +
            "time                  AS time " +
            "FROM keyboardevent WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadCameras');
            } else {
                self.results.cameras = [];
                for (var i in result.rows) {
                    self.results.cameras.push(
                        {
                            type: 'camera',
                            position : {
                                x: result.rows[i].px,
                                y: result.rows[i].py,
                                z: result.rows[i].pz
                            },
                            target : {
                                x: result.rows[i].tx,
                                y: result.rows[i].ty,
                                z: result.rows[i].tz
                            },
                            time: result.rows[i].time
                        }
                    );
                }
            }
            self.ready.cameras = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the coin information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadCoins = function() {
    var self = this;
    this.client.query(
        "SELECT coin_id AS \"coinId\", time FROM coinclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err,result) {
            if (err !== null) {
                Log.dberror(err + ' in loadCoins');
            } else {
                self.results.coins = [];
                for (var i in result.rows) {
                    self.results.coins.push(
                        {
                            type: 'coin',
                            time: result.rows[i].time,
                            id: result.rows[i].coinId
                        }
                    );
                }
            }
            self.ready.coins = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the recommendation information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadArrows = function() {
    var self = this;
    this.client.query(
        "SELECT arrow_id AS \"arrowId\", time FROM arrowclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadArrows');
            } else {
                self.results.arrows = [];
                for (var i in result.rows) {
                    self.results.arrows.push(
                        {
                            type: 'arrow',
                            time: result.rows[i].time,
                            id: result.rows[i].arrowId
                        }
                    );
                }
            }
            self.ready.arrows = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the reset information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadResets = function() {
    var self = this;
    this.client.query(
        "SELECT time FROM resetclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadResets');
            } else {
                self.results.resets = [];
                for (var i in result.rows) {
                    self.results.resets.push(
                        {
                            type: 'reset',
                            time: result.rows[i].time
                        }
                    );
                }
            }
            self.ready.resets = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the previous / next information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadPreviousNext = function () {
    var self = this;
    this.client.query(
        "SELECT ((camera).position).x AS px, " +
            "((camera).position).y AS py, " +
            "((camera).position).z AS pz, " +
            "((camera).target).x   AS tx, " +
            "((camera).target).y   AS ty, " +
            "((camera).target).z   AS tz, " +
            "time                  AS time " +
            "FROM previousnextclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadPreviousNext');
            } else {
                self.results.previousNext = [];
                for (var i in result.rows) {
                    self.results.previousNext.push(
                        {
                            type: 'previousnext',
                            time: result.rows[i].time,
                            previous: result.rows[i].previousnext == 'p',
                            position : {
                                x: result.rows[i].px,
                                y: result.rows[i].py,
                                z: result.rows[i].pz
                            },
                            target : {
                                x: result.rows[i].tx,
                                y: result.rows[i].ty,
                                z: result.rows[i].tz
                            }
                        }
                    );
                }
            }
            self.ready.previousNext = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the hovered information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadHovered = function() {
    var self = this;
    this.client.query(
        "SELECT start, time, arrow_id AS \"arrowId\" FROM hovered WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadHovered');
            } else {
                self.results.hovered = [];
                for (var i in result.rows) {
                    self.results.hovered.push(
                        {
                            type: "hovered",
                            time: result.rows[i].time,
                            start: result.rows[i].start,
                            id: result.rows[i].arrowId
                        }
                    );
                }
            }
            self.ready.hovered = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the pointer lock information from the DB and
 * tries to merge when finished
 */
DBReq.Info.prototype.loadPointerLocked = function() {
    var self = this;
    this.client.query(
        "SELECT time, locked FROM pointerlocked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadPointerLocked');
            } else {
                self.results.pointerlocked = [];
                for (var i in result.rows) {
                    self.results.pointerlocked.push(
                        {
                            type: "pointerlocked",
                            locked: result.rows[i].locked,
                            time: result.rows[i].time
                        }
                    );
                }
            }
            self.ready.pointerLocked = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the switch pointer lock option information
 * from the DB and tries to merge when finished
 */
DBReq.Info.prototype.loadSwitchedLockOption = function() {
    var self = this;
    this.client.query(
        "SELECT time, locked FROM switchedlockoption WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadSwitchedLockOption');
            } else {
                self.results.switchedlockoption = [];
                for (var i in result.rows) {
                    self.results.switchedlockoption.push(
                        {
                            type: "switchedlockoption",
                            locked: result.rows[i].locked,
                            time:  result.rows[i].time
                        }
                    );
                }
            }
            self.ready.switchedLockOption = true;
            self.tryMerge();
        }
    );
};

/**
 * Launches the SQL request to load the coins used in the expermient from the
 * DB and tries to merge when finished
 */
DBReq.Info.prototype.loadRedCoins = function() {
    var self = this;
    this.client.query(
        "SELECT coin_1 AS coin1, \n" +
        "       coin_2 AS coin2, \n" +
        "       coin_3 AS coin3, \n" +
        "       coin_4 AS coin4, \n" +
        "       coin_5 AS coin5, \n" +
        "       coin_6 AS coin6, \n" +
        "       coin_7 AS coin7, \n" +
        "       coin_8 AS coin8 \n" +
        "FROM CoinCombination, Experiment \n" +
        "WHERE CoinCombination.id = Experiment.coin_combination_id AND \n" +
        "      Experiment.id = $1;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadRedCoins');
            } else {
                self.redCoins.push(result.rows[0].coin1);
                self.redCoins.push(result.rows[0].coin2);
                self.redCoins.push(result.rows[0].coin3);
                self.redCoins.push(result.rows[0].coin4);
                self.redCoins.push(result.rows[0].coin5);
                self.redCoins.push(result.rows[0].coin6);
                self.redCoins.push(result.rows[0].coin7);
                self.redCoins.push(result.rows[0].coin8);
            }
            self.ready.redCoins = true;
            self.tryMerge();
        }
    );
};

/**
 * Class that creates a user
 * @param finishAction {function} callback that has as a parameter the id of
 * the new user
 * @memberof DBReq
 * @constructor
 */
DBReq.UserCreator = function(workerId, age, male, rating, lastTime, finishAction) {
    /**
     * Callback to call on the id when the user is created
     * @type {function}
     */
    this.finishAction = finishAction;

    this.workerId = workerId;
    this.age = age;
    this.male = male;
    this.rating = rating;
    this.lastTime = lastTime;

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

/**
 * Executes the SQL request and calls the callback
 */
DBReq.UserCreator.prototype.execute = function() {
    var self = this;
    this.client.query("BEGIN; LOCK Users;", [], function() {
        self.client.query(
            "INSERT INTO users(worker_id, age, male, rating, lasttime)  VALUES($1, $2, $3, $4, $5);",
            [
                self.workerId,
                self.age,
                self.male,
                self.rating,
                self.lastTime
            ],
            function(err, result) {
                if (err !== null) {
                    Log.dberror(err + ' in UserCreator INSERT INTO');
                }
                self.client.query(
                    "SELECT max(id) FROM Users;",
                    [],
                    function(err, result) {
                        self.finalResult = result.rows[0].max;
                        self.finish();
                    }
                );
            }
        );
    });
};

/**
 * Release the DB connection and call the callback
 */
DBReq.UserCreator.prototype.finish = function() {

    var self = this;

    this.client.query("COMMIT;", [], function() {

        self.release();
        self.client = null;
        self.release = null;

        self.finishAction(self.finalResult);

    });
};

/**
 * Class that creates an experiment
 * @param userId {Number} id of the user that does the experiment
 * @param sceneId {Number} id of the scene the experiment is based on
 * @param finishAction {function} callback that has as a parameter the id of
 * the new experiment
 * @memberof DBReq
 * @constructor
 */
DBReq.ExpCreator = function(userId, finishAction) {
    this.finishAction = finishAction;
    this.userId = userId;
    this.finalResult = {};

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {

        self.client = client;
        self.release = release;

        // Start transaction and lock table
        self.client.query("BEGIN; LOCK CoinCombination; LOCK Experiment;", [], function() {
            self.execute();
        });
    });
};

/**
 * Executes the SQL request and calls the callback
 */
// Abandon all hope ye who enter here
DBReq.ExpCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT DISTINCT \n" +
        "    RecommendationStyle.name, \n" +
        "    CoinCombination.scene_id AS \"sceneId\", \n" +
        "    CoinCombination.id, \n" +
        "    coin_1 AS coin1, \n" +
        "    coin_2 AS coin2, \n" +
        "    coin_3 AS coin3, \n" +
        "    coin_4 AS coin4, \n" +
        "    coin_5 AS coin5, \n" +
        "    coin_6 AS coin6, \n" +
        "    coin_7 AS coin7, \n" +
        "    coin_8 AS coin8\n" +
        "FROM CoinCombination, Experiment, Users U, Users Other, RecommendationStyle, Scene\n" +
        "WHERE\n" +
        "    Scene.id = CoinCombination.scene_id AND\n" +
        "    Scene.name != 'peachcastle' AND\n" +
        "    CoinCombination.id = Experiment.coin_combination_id AND\n" +
        "    Other.id = Experiment.user_id AND\n" +
        "    Other.rating = U.rating AND\n" +
        "    Other.id != U.id AND\n" +
        "    U.id = $1 AND\n" +
        "    RecommendationStyle.name NOT IN (\n" +
        "        SELECT DISTINCT Experiment.recommendation_style\n" +
        "        FROM CoinCombination, Experiment, Users U, Users Other\n" +
        "        WHERE\n" +
        "            CoinCombination.id = Experiment.coin_combination_id AND\n" +
        "            Other.id = Experiment.user_id AND\n" +
        "            Other.rating = U.rating AND\n" +
        "            Other.id != U.id AND\n" +
        "            CoinCombination.scene_id = Scene.id\n" +
        "    ) AND\n" +
        "    RecommendationStyle.name NOT IN (\n" +
        "        SELECT DISTINCT Experiment.recommendation_style\n" +
        "        FROM Experiment\n" +
        "        WHERE Experiment.user_id = $1 AND Experiment.recommendation_style != ''\n" +
        "    ) AND\n" +
        "   CoinCombination.scene_id NOT IN (\n" +
        "       SELECT DISTINCT scene_id\n" +
        "       FROM Experiment, CoinCombination\n" +
        "       WHERE Experiment.coin_combination_id = CoinCombination.id AND Experiment.user_id = $1\n" +
        "   )\n" +
        "LIMIT 1;",
        [self.userId],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in ExpCreator first request');
            }
            if (result.rows.length > 0) {
                // Set the result
                self.finalResult.coinCombinationId = result.rows[0].id;
                self.finalResult.sceneId = result.rows[0].sceneId;
                self.finalResult.recommendationStyle = result.rows[0].name;
                self.finalResult.coins = [
                    result.rows[0].coin1,
                    result.rows[0].coin2,
                    result.rows[0].coin3,
                    result.rows[0].coin4,
                    result.rows[0].coin5,
                    result.rows[0].coin6,
                    result.rows[0].coin7,
                    result.rows[0].coin8
                ];

                // There is a suggested experiment : create it
                self.client.query(
                    "INSERT INTO Experiment(user_id, coin_combination_id, recommendation_style)\n" +
                    "VALUES($1,$2,$3)\n" +
                    "RETURNING id",
                    [self.userId, result.rows[0].id, result.rows[0].name],
                    function(err, result) {
                        if (err !== null) {
                            Log.dberror(err + ' in ExpCreator second request (with suggested experiment)');
                        }
                        self.finalResult.expId = result.rows[0].id;
                        self.finish();
                    }
                );


            } else {
                // Find the scene / recommendation style for the new experiment
                self.client.query(
                    "SELECT RecommendationStyle.name, Scene.id AS \"sceneId\"\n" +
                    "FROM RecommendationStyle, Scene\n" +
                    "WHERE\n" +
                    "    RecommendationStyle.name NOT IN(\n" +
                    "        SELECT Experiment.recommendation_style AS name\n" +
                    "        FROM Experiment\n" +
                    "        WHERE Experiment.user_id = $1\n" +
                    "        AND Experiment.recommendation_style != ''\n" +
                    "    ) AND\n" +
                    "    Scene.id NOT IN(\n" +
                    "        SELECT DISTINCT CoinCombination.scene_id AS id\n" +
                    "        FROM Experiment, CoinCombination\n" +
                    "        WHERE\n" +
                    "            Experiment.coin_combination_id = CoinCombination.id AND\n" +
                    "            user_id = $1\n" +
                    "    ) AND\n" +
                    "    Scene.name != 'peachcastle'\n" +
                    "\n" +
                    "ORDER BY RANDOM()\n" +
                    "LIMIT 1;",
                    [self.userId],
                    function(err, result) {
                        if (err !== null) {
                            Log.dberror(err + ' in ExpCreator second request (without suggested experiment');
                        }
                        if (result.rows.length > 0) {
                            self.finalResult.sceneId = result.rows[0].sceneId;
                            self.finalResult.recommendationStyle = result.rows[0].name;

                            // Generate random coins
                            self.client.query(
                                "SELECT generate_series AS id\n" +
                                "FROM Scene, generate_series(0,Scene.coin_number-1)\n" +
                                "WHERE Scene.id = $1\n" +
                                "ORDER BY RANDOM()\n" +
                                "LIMIT 8;",
                                [self.finalResult.sceneId],
                                function(err, result) {
                                    if (err !== null) {
                                        Log.dberror(err + ' in ExpCreator third request (without suggested experiment');
                                    }
                                    self.finalResult.coins = [];
                                    for (var i = 0; i < 8; i++) {
                                        self.finalResult.coins.push(result.rows[i].id);
                                    }

                                    // And then, create the CoinCombination
                                    self.client.query(
                                        "INSERT INTO CoinCombination(scene_id, coin_1, coin_2, coin_3, coin_4, coin_5, coin_6, coin_7, coin_8)\n" +
                                        "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)\n" +
                                        "RETURNING id;",
                                        [
                                            self.finalResult.sceneId,
                                            self.finalResult.coins[0],
                                            self.finalResult.coins[1],
                                            self.finalResult.coins[2],
                                            self.finalResult.coins[3],
                                            self.finalResult.coins[4],
                                            self.finalResult.coins[5],
                                            self.finalResult.coins[6],
                                            self.finalResult.coins[7],
                                        ],
                                        function(err, result) {
                                            if (err !== null) {
                                                Log.dberror(err + ' in ExpCreator fourth request (without suggested experiment');
                                            }
                                            self.finalResult.coinCombinationId = result.rows[0].id;

                                            // And create the experiment
                                            self.client.query(
                                                "INSERT INTO Experiment(user_id, coin_combination_id, recommendation_style)\n" +
                                                "VALUES($1,$2,$3)\n" +
                                                "RETURNING id;",
                                                [self.userId, self.finalResult.coinCombinationId, self.finalResult.recommendationStyle],
                                                function(err, result) {
                                                    if (err !== null) {
                                                        Log.dberror(err + ' in ExpCreator fifth request (without suggested experiment');
                                                    }
                                                    self.finalResult.expId = result.rows[0].id;
                                                    self.finish();
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        } else {
                            self.finish();
                        }
                    }
                );
            }
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.ExpCreator.prototype.finish = function() {
    var self = this;

    // Commit, and then release
    this.client.query("COMMIT;", function() {

        self.release();
        self.client = null;
        self.release = null;

        self.finishAction(
            self.finalResult.expId,
            self.finalResult.coinCombinationId,
            self.finalResult.sceneId,
            self.finalResult.recommendationStyle,
            self.finalResult.coins
        );
    });
};

/**
 * Class that creates an experiment
 * @param id {Number} id of the user that does the experiment
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 * @constructor
 */
DBReq.UserIdChecker = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

/**
 * Executes the SQL request and calls the callback
 */
DBReq.UserIdChecker.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT count(id) > 0 AS answer FROM users WHERE id = $1;",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in UserIdChecker');
                return;
            }
            self.finalResult = result.rows[0].answer;
            self.finish();
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.UserIdChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

DBReq.UserNameChecker = function(name, finishAction) {
    this.name = name;
    this.finishAction = finishAction;
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        if (err) {
            Log.dberror(err + ' in UserNameChcker connection');
            return;
        }
        self.client = client;
        self.release = release;
        self.execute();
    });
};

DBReq.UserNameChecker.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT count(id) > 0 AS answer FROM users WHERE worker_id = $1",
        [self.name],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in UserNameChecker');
                return;
            }
            self.finalResult = result.rows[0].answer;
            self.finish();
        }
    );

};

DBReq.UserNameChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

/**
 * Class that creates an experiment
 * @param id {Number} id of the experiment to check
 * @param finishAction {function} callback that has as a parameter which is the
 * id of the scene if the experiment exists, or null otherwise
 * @memberof DBReq
 * @constructor
 */
DBReq.ExpIdChecker = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

/**
 * Executes the SQL request and calls the callback
 */
DBReq.ExpIdChecker.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT scene_id AS \"sceneId\" FROM experiment, CoinCombination WHERE CoinCombination.id = Experiment.coin_combination_id AND Experiment.id = $1;",
        [self.id],
        function(err, result) {
            if (result === undefined || result.rows.length === 0) {
                self.finalResult = null;
            } else {
                self.finalResult = result.rows[0].sceneId;
            }
            self.finish();
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.ExpIdChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

DBReq.LastExpGetter = function(userId, finishAction) {

    var self = this;
    this.userId = userId;
    this.finishAction = finishAction;
    this.finalResult = {};

    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

DBReq.LastExpGetter.prototype.execute = function() {
    var self = this;
    this.client.query(
        'SELECT scene_id AS "sceneId", \n' +
        '       coin_1, \n' +
        '       coin_2, \n' +
        '       coin_3, \n' +
        '       coin_4, \n' +
        '       coin_5, \n' +
        '       coin_6, \n' +
        '       coin_7, \n' +
        '       coin_8, \n' +
        '       Experiment.recommendation_style AS "recommendationStyle" \n' +
        'FROM Experiment, CoinCombination \n' +
        'WHERE Experiment.coin_combination_id = CoinCombination.id \n' +
        '      AND Experiment.user_id = $1 \n' +
        'ORDER BY Experiment.id DESC \n' +
        'LIMIT 1;',
        [self.userId],
        function (err, result) {
            self.finalResult.sceneId = result.rows[0].sceneId;
            self.finalResult.recommendationStyle = result.rows[0].recommendationStyle;
            self.finalResult.coins = [
                result.rows[0].coin_1,
                result.rows[0].coin_2,
                result.rows[0].coin_3,
                result.rows[0].coin_4,
                result.rows[0].coin_5,
                result.rows[0].coin_6,
                result.rows[0].coin_7,
                result.rows[0].coin_8
            ];
            self.finish();
        }
    );
};

DBReq.LastExpGetter.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult.sceneId, this.finalResult.recommendationStyle, this.finalResult.coins);
}

/**
 * Class that gets the info from all experiment
 * @param finishAction {function} callback that has as a parameter which is an
 * array of objects containing the id, the username, the name of the scene and
 * the id of the user.
 * @memberof DBReq
 * @constructor
 */
DBReq.ExpGetter = function(finishAction) {
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

/**
 * Executes the SQL request and calls the callback
 */
DBReq.ExpGetter.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT  " +
            "experiment.id AS \"expId\", " +
            "users.worker_id AS username, " +
            "scene.name AS scenename, " +
            "users.id AS \"userId\" " +
        "FROM experiment, users, scene, CoinCombination " +
        "WHERE experiment.user_id = users.id and scene.id = CoinCombination.scene_id AND " +
        "      Experiment.coin_combination_id = CoinCombination.id " +
        "ORDER BY experiment.id;",
        [],
        function(err, result) {
            self.finalResult = result.rows;
            self.finish();
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.ExpGetter.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

DBReq.TutorialCreator = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;
    this.finalResult = {};

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

DBReq.TutorialCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        // Generate random coins
        "SELECT Scene.id AS \"sceneId\", generate_series AS id\n" +
        "FROM Scene, generate_series(0,Scene.coin_number-1)\n" +
        "WHERE Scene.name = 'peachcastle'\n" +
        "ORDER BY RANDOM()\n" +
        "LIMIT 8;",
        [],
        function(err, result) {
            self.finalResult.coins = [];
            for (var i = 0; i < 8; i++) {
                self.finalResult.coins.push(result.rows[i].id);
            }
            // Create CoinCombination
            self.client.query(
                "INSERT INTO CoinCombination(scene_id, coin_1, coin_2, coin_3, coin_4, coin_5, coin_6, coin_7, coin_8)\n" +
                "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)\n" +
                "RETURNING id;",
                [
                    result.rows[0].sceneId,
                    result.rows[0].id,
                    result.rows[1].id,
                    result.rows[2].id,
                    result.rows[3].id,
                    result.rows[4].id,
                    result.rows[5].id,
                    result.rows[6].id,
                    result.rows[7].id
                ],
                function(err, result) {
                    // Create experiment
                    self.client.query(
                        "INSERT INTO Experiment(user_id, coin_combination_id)\n" +
                        "VALUES($1,$2)\n" +
                        "RETURNING id;",
                        [self.id, result.rows[0].id],
                        function(err, result) {
                            self.finalResult.expId = result.rows[0].id;
                            self.finish();
                        }
                    );
                }
            );
        }
    );
};

DBReq.TutorialCreator.prototype.finish = function() {
    this.release();
    this.release = null;
    this.client = null;

    this.finishAction(this.finalResult.expId, this.finalResult.coins);
};

/**
 * Try to get a user by id, and creates it if it doesn't exists
 * @param id {Number} id to test
 * @param callback {function} callback to call on the id
 * @memberof DBReq
 */
DBReq.tryUser = function(id, callback) {
    if (id !== undefined && id !== null) {
        new DBReq.UserIdChecker(id, function(clear) {
            if (clear) {
                callback(id);
            } else {
                new DBReq.UserCreator(callback);
            }
        });
    } else {
        new DBReq.UserCreator(callback);
    }
};

/**
 * Get all the info from an experiment
 * @memberof DBReq
 * @param id {Number} id of the experiment to get the info
 * @param callback {function} callback called on the result of all the SQL requests
 */
DBReq.getInfo = function(id, callback) {
    new DBReq.Info(id, callback);
};

/**
 * Creates a user
 * @memberof DBReq
 * @param callback {function} callback called on the new user id
 */
DBReq.createUser = function(workerId, age, male, rating, lastTime, callback) {
    new DBReq.UserCreator(workerId, age, male, rating, lastTime, callback);
};

/**
 * Creates an experiment
 * @memberof DBReq
 * @param id {Number} id of the user doing the experiment
 * @param sceneId {Number} id of the scene on which the experiment is
 * @param callback {function} callback called on the new experiment id
 */
DBReq.createExp = function(id, callback) {
    new DBReq.ExpCreator(id, callback);
};

DBReq.createTutorial = function(id, callback) {
    new DBReq.TutorialCreator(id, callback);
};

/**
 * Checks the user id
 * @memberof DBReq
 * @param id {Number} id to check
 * @param callback {function} callback called on a boolean (true if the user id
 * exists, false otherwise)
 */
DBReq.checkUserId = function(id, callback) {
    new DBReq.UserIdChecker(id, callback);
};

DBReq.checkUserName = function(name, callback) {
    new DBReq.UserNameChecker(name, callback);
};

/**
 * Checks if an experiment id exists
 * @memberof DBReq
 * @param id {Number} id of the experiment to check
 * @param callback {function} callback called on an object (null if the
 * experiment doesn't exist, an object containing username, sceneId,
 * scenename, and expId if it exists
 */
DBReq.checkExpId = function(id, callback) {
    new DBReq.ExpIdChecker(id, callback);
};

/**
 * Gets a list of all experiments
 * @memberof DBReq
 * @param callback {function} callback called on an array containing all experiments
 */
DBReq.getAllExps = function(callback) {
    new DBReq.ExpGetter(callback);
};

DBReq.getLastExp = function(id, callback) {
    new DBReq.LastExpGetter(id, callback);
};

module.exports = DBReq;
