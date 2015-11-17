// Polyfill of find array
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this === null || this === undefined) {
            throw new TypeError('Array.prototype.find a été appelé sur null ou undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate doit être une fonction');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback /*, initialValue*/) {
        'use strict';
        if (this === null || this === undefined) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        var t = Object(this), len = t.length >>> 0, k = 0, value;
        if (arguments.length == 2) {
            value = arguments[1];
        } else {
            while (k < len && !(k in t)) {
                k++;
            }
            if (k >= len) {
                throw new TypeError('Reduce of empty array with no initial value');
            }
            value = t[k++];
        }
        for (; k < len; k++) {
            if (k in t) {
                value = callback(value, t[k], k, t);
            }
        }
        return value;
    };
}

var pg = require('pg');
var pgc = require('../../private.js');
var Log = require('../../lib/NodeLog.js');
var async = require('async');

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
 * @private
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
        redCoins: false,
        sceneInfo: false
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
    this.loadSceneInfo();
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

    this.finalResult.sceneInfo = this.sceneInfo;
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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
                var i = 0;
                for (; i < result.rows.length; i++) {
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

DBReq.Info.prototype.loadSceneInfo = function() {
    var self = this;
    this.client.query(
        'SELECT Experiment.recommendation_style AS "recommendationStyle", \n' +
        '       CoinCombination.scene_id AS "sceneId" \n' +
        'FROM Experiment, CoinCombination \n' +
        'WHERE Experiment.coin_combination_id = CoinCombination.id AND Experiment.id = $1;',
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadSceneInfo');
                console.log(err);
            } else {
                self.sceneInfo = {
                    recommendationStyle : result.rows[0].recommendationStyle,
                    sceneId : result.rows[0].sceneId
                };
            }
            self.ready.sceneInfo = true;
            self.tryMerge();
        }
    );
};

/**
 * Class that creates a user
 * @param workerId {string} the name of the person doing the experiment
 * @param age {string} a string representing an age range
 * @param male {boolean} indicates if the user is a man or a woman
 * @param rating {Number} between 1 and 5, describes the level of the user
 * @param lastTime {Number} between 0 and 3 such that
 * <ol start="0">
 *  <li>never played</li>
 *  <li>this year</li>
 *  <li>this month</li>
 *  <li>this week</li>
 * </ol>
 * @param finishAction {function} callback that has as a parameter the id of
 * the new user
 * @memberof DBReq
 * @constructor
 * @private
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
    this.client.query("BEGIN; LOCK Users IN SHARE ROW EXCLUSIVE MODE;", [], function() {
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
 * @param experiments {Object[]} array of objects representing the experiments
 * that the user has already done <code>{sceneId: Number, recommendationStyle: string, coins Number[]}</code>
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 * @constructor
 * @private
 */
DBReq.ExpCreator = function(userId, experiments, finishAction) {
    this.finishAction = finishAction;
    this.userId = userId;
    this.experiments = experiments;
    this.finalResult = {};

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {

        self.client = client;
        self.release = release;

        self.startTime = Date.now();

        // Start transaction and lock table
        self.client.query("BEGIN; LOCK CoinCombination IN SHARE ROW EXCLUSIVE MODE; LOCK Experiment IN SHARE ROW EXCLUSIVE MODE;", [], function() {
            self.execute();
        });
    });
};

function predicate(line) {

    return function(elt, idx, arr) {

        return (
            (elt.recommendationStyle !== null && (elt.recommendationStyle.trim() === line.recommendationStyle.trim())) ||
            line.sceneId === elt.sceneId
        );

    };

}

/**
 * Executes the SQL request and calls the callback
 */
// Abandon all hope ye who enter here
DBReq.ExpCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT DISTINCT \n" +
        "    RecommendationStyle.name AS \"recommendationStyle\", \n" +
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
        "    Experiment.finished = true AND\n" +
        "    Other.rating = U.rating AND\n" +
        "    Other.id != U.id AND\n" +
        "    U.id = $1 \n" +
        "EXCEPT \n" +
        "SELECT DISTINCT \n" +
        "    Experiment.recommendation_style AS \"recommendationStyle\", \n" +
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
        "FROM CoinCombination, Experiment\n" +
        "WHERE\n" +
        "   CoinCombination.id = Experiment.coin_combination_id;",
        [self.userId],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in ExpCreator first request');
            }

            var line, found = false;

            while ((line = result.rows.shift()) !== undefined) {

                if (line === undefined) {

                    break;

                }

                // Look for an experiment impossible
                var elt = self.experiments.find(predicate(line));

                // Line is a valid experiment
                if (elt === undefined) {

                    found = true;
                    break;

                }

            }

            if (found) {
                // Set the result
                self.finalResult.coinCombinationId = line.id;
                self.finalResult.sceneId = line.sceneId;
                self.finalResult.recommendationStyle = line.recommendationStyle;
                self.finalResult.coins = [
                    line.coin1,
                    line.coin2,
                    line.coin3,
                    line.coin4,
                    line.coin5,
                    line.coin6,
                    line.coin7,
                    line.coin8
                ];

                // There is a suggested experiment : create it
                self.client.query(
                    "INSERT INTO Experiment(user_id, coin_combination_id, recommendation_style)\n" +
                    "VALUES($1,$2,$3)\n" +
                    "RETURNING id",
                    [self.userId, line.id, line.recommendationStyle],
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
                    "    Scene.name != 'peachcastle' AND \n" +
                    "    RecommendationStyle.name NOT IN(\n" +
                    "        SELECT DISTINCT Experiment.recommendation_style AS name\n" +
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
                    "    ) \n" +
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

    // self.finishAction(
    //     self.finalResult.expId,
    //     self.finalResult.coinCombinationId,
    //     self.finalResult.sceneId,
    //     self.finalResult.recommendationStyle,
    //     self.finalResult.coins
    // );

    // Commit, and then release
    this.client.query("COMMIT;", function() {

        Log.debug('Exp creation took ' + (Date.now() - self.startTime) + ' ms', true);

        self.release();
        self.client = null;
        self.release = null;

        self.finishAction(
            self.finalResult.expId,
            self.finalResult.sceneId,
            self.finalResult.coinCombinationId,
            self.finalResult.recommendationStyle,
            self.finalResult.coins
        );
    });
};

/**
 * Class that checks if an user id exists
 * @param id {Number} id of the user to check
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 * @constructor
 * @private
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

/**
 * Class that checks if a workerId exists
 * @param id {string} workerId of to test
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 * @constructor
 * @private
 */
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

/**
 * Executes the SQL request and calls the callback
 */
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

/**
 * Release the DB connection and call the callback
 */
DBReq.UserNameChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

/**
 * Class that checks if an experiment exists
 * @param id {Number} id of the experiment to check
 * @param finishAction {function} callback that has as a parameter which is the
 * id of the scene if the experiment exists, or null otherwise
 * @memberof DBReq
 * @constructor
 * @private
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

/**
 * Class that gives access to the last not finished experiment
 * @param id {Number} id of the user of who you want the last experiment
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>xperiment exists, or null otherwise
 * @memberof DBReq
 * @private
 * @constructor
 */
DBReq.LastExpGetter = function(userId, finishAction) {

    var self = this;
    this.userId = userId;
    this.finishAction = finishAction;
    this.finalResult = {};

    if (this.userId === undefined) {
        return;
    }

    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
};

/**
 * Executes the SQL request and calls the callback
 */
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
        '       Experiment.recommendation_style AS "recommendationStyle", \n' +
        '       Experiment.id AS "expId", \n' +
        '       CoinCombination.id as "coinCombinationId" \n' +
        'FROM Experiment, CoinCombination \n' +
        'WHERE Experiment.coin_combination_id = CoinCombination.id \n' +
        '      AND Experiment.user_id = $1 \n' +
        '      AND NOT Experiment.finished \n' +
        'ORDER BY Experiment.id DESC \n' +
        'LIMIT 1;',
        [self.userId],
        function (err, result) {

            if (err !== null) {
                Log.dberror(err + ' in LastExpGetter (DBReq)');
            }

            if (result.rows.length === 0) {
                Log.debug('Timeout', true);
                setTimeout(function() {
                    self.execute();
                }, 1000);
                return;
            }

            self.client.query(
                'UPDATE Experiment SET finished = true WHERE id = $1',
                [result.rows[0].expId],
                function() {
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
                    self.finalResult.coinCombinationId = result.rows[0].coinCombinationId;
                    self.finalResult.expId = result.rows[0].expId;
                    self.finish();

                }
            );
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.LastExpGetter.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(
        this.finalResult.expId,
        this.finalResult.sceneId,
        this.finalResult.coinCombinationId,
        this.finalResult.recommendationStyle,
        this.finalResult.coins
    );
};

/**
 * Class that gets the info from all experiment
 * @param finishAction {function} callback that has as a parameter which is an
 * array of objects containing the id, the username, the name of the scene and
 * the id of the user.
 * @memberof DBReq
 * @constructor
 * @private
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

/**
 * Class that creates a tutorial
 * @param id {Number} id of the user doing the tutorial
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the generated coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 * @constructor
 * @private
 */
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

/**
 * Executes the SQL request and calls the callback
 */
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
                        "INSERT INTO Experiment(user_id, coin_combination_id, finished)\n" +
                        "VALUES($1,$2, true)\n" +
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

/**
 * Release the DB connection and call the callback
 */
DBReq.TutorialCreator.prototype.finish = function() {
    this.release();
    this.release = null;
    this.client = null;

    this.finishAction(this.finalResult.expId, this.finalResult.coins);
};

/**
 * Class that verifies that a user has correctly done all the experiments
 * @param userId {Number} id of the user to verify
 * @param finishAction {function} callback that has as parameter a boolean
 * which is true is the verification was a success
 * @memberof DBReq
 * @constructor
 * @private
 */
DBReq.UserVerifier = function(userId, finishAction) {
    this.userId = userId;
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
DBReq.UserVerifier.prototype.execute = function() {

    var self = this;
    this.client.query(
        "SELECT id as \"expId\" FROM Experiment WHERE user_id = $1",
        [self.userId],
        function(err, result) {
            if (result.rows.length !== 4) {
                self.finish(false);
            }

            async.map(
                result.rows,
                function(elt, callback) {
                    self.client.query(
                        "SELECT count(*) > 5 AS ok FROM CoinClicked WHERE exp_id = $1",
                        [elt.expId],
                        function(err, result) {
                            callback(null, result.rows[0].ok === true);
                        }
                    );
                },
                function(err, result) {
                    var ok = result.reduce(function(prev, next) { return prev && next; });
                    self.client.query(
                        "UPDATE Users SET valid = $1 WHERE id = $2",
                        [ok, self.userId],
                        function(err, result) {
                            self.finish(ok);
                        }
                    );
                }
            );
        }
    );

};

/**
 * Release the DB connection and call the callback
 */
DBReq.UserVerifier.prototype.finish = function(finalResult) {
    this.release();

    this.client = null;
    this.release = null;
    this.finishAction(finalResult);
};

/**
 * Class that gets the "valid" attribute of a user in the databse
 * @param userId {Number} id of the user
 * @param finishAction {function} callback that has as parameters :
 * <ol>
 *  <li>the workerId of the user (string)</li>
 *  <li>the "valid" attribute of the database (boolean)</li>
 * </ol>
 * @memberof DBReq
 * @constructor
 * @private
 */
DBReq.UserGetter = function(userId, finishAction) {
    this.userId = userId;
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
DBReq.UserGetter.prototype.execute = function() {
    var self = this;

    this.client.query(
        'SELECT worker_id AS "workerId", valid FROM Users WHERE id = $1',
        [self.userId],
        function(err, result) {
            self.finish(result.rows[0].workerId, result.rows[0].valid);
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.UserGetter.prototype.finish = function(workerId, valid) {

    this.release();
    this.release = null;
    this.client = null;

    this.finishAction(workerId, valid);

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

// Helper for the rest
// http://stackoverflow.com/questions/9830359/apply-an-array-to-a-constructor-function-in-javascript
function construct(constr, args) {
  var instance = Object.create(constr.prototype);
  var result = constr.apply(instance, args);
  return typeof result === 'object' ? result : instance;  // yes, this is what 'new' does
}

/**
 * Loads every information from an experiment
 * (wraps the {@link DBReq.Info} constructor)
 * @param id {Number} id of the experiment to load
 * @param finishAction {function} callback on the result when loading is
 * finished
 * @memberof DBReq
 */
DBReq.getInfo = function() { construct(DBReq.Info, arguments); };

/**
 * Creates an user
 * (wraps the {@link DBReq.UserCreator} constructor)
 * @param workerId {string} the name of the person doing the experiment
 * @param age {string} a string representing an age range
 * @param male {boolean} indicates if the user is a man or a woman
 * @param rating {Number} between 1 and 5, describes the level of the user
 * @param lastTime {Number} between 0 and 3 such that
 * <ol start="0">
 *  <li>never played</li>
 *  <li>this year</li>
 *  <li>this month</li>
 *  <li>this week</li>
 * </ol>
 * @param finishAction {function} callback that has as a parameter the id of
 * the new user
 * @memberof DBReq
 */
DBReq.createUser = function() { construct(DBReq.UserCreator, arguments); };

/**
 * Creates an experiment
 * (wraps the {@link DBReq.ExpCreator} constructor)
 * @param userId {Number} id of the user that does the experiment
 * @param experiments {Object[]} array of objects representing the experiments
 * that the user has already done <code>{sceneId: Number, recommendationStyle: string, coins Number[]}</code>
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 */
DBReq.createExp = function() { construct(DBReq.ExpCreator, arguments); };

/**
 * Creates a tutorial
 * (wraps the {@link DBReq.TurorialCreator} constructor)
 * @param id {Number} id of the user doing the tutorial
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the generated coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 */
DBReq.createTutorial = function() { construct(DBReq.TutorialCreator, arguments); };

/**
 * Checks if an user id exists
 * (wraps the {@link DBReq.UserIdChecker} constructor)
 * @param id {Number} id of the user to check
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 */
DBReq.checkUserId = function() { construct(DBReq.UserIdChecker, arguments); };

/**
 * Checks if a workerId exists
 * (wraps the {@link DBReq.UserNameChecker} constructor)
 * @param id {string} workerId of to test
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 */
DBReq.checkUserName = function() { construct(DBReq.UserNameChecker, arguments); };

/**
 * Checks if an experiment exists
 * (wraps the {@link DBReq.ExpIdChecker} constructor)
 * @param id {Number} id of the experiment to check
 * @param finishAction {function} callback that has as a parameter which is the
 * id of the scene if the experiment exists, or null otherwise
 * @memberof DBReq
 */
DBReq.checkExpId = function() { construct(DBReq.ExpIdChecker, arguments); };

/**
 * Gets the info from all experiment
 * (wraps the {@link DBReq.ExpGetter} constructor)
 * @param finishAction {function} callback that has as a parameter which is an
 * array of objects containing the id, the username, the name of the scene and
 * the id of the user.
 * @memberof DBReq
 */
DBReq.getAllExps = function() { construct(DBReq.ExpGetter, arguments); };

/**
 * Gives access to the last not finished experiment
 * (wraps the {@link DBReq.LastExpGetter} constructor)
 * @param id {Number} id of the user of who you want the last experiment
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>xperiment exists, or null otherwise
 * @memberof DBReq
 */
DBReq.getLastExp = function() { construct(DBReq.LastExpGetter, arguments); };

/**
 * Verifies that a user has correctly done all the experiments
 * (wraps the {@link DBReq.UserVerifier} constructor)
 * @param userId {Number} id of the user to verify
 * @param finishAction {function} callback that has as parameter a boolean
 * which is true is the verification was a success
 * @memberof DBReq
 */
DBReq.verifyUser = function() { construct(DBReq.UserVerifier, arguments); };

/**
 * Gets the "valid" attribute of a user in the databse
 * (wraps the {@link DBReq.UserGetter} constructor)
 * @param userId {Number} id of the user
 * @param finishAction {function} callback that has as parameters :
 * <ol>
 *  <li>the workerId of the user (string)</li>
 *  <li>the "valid" attribute of the database (boolean)</li>
 * </ol>
 * @memberof DBReq
 */
DBReq.getUser = function() { construct(DBReq.UserGetter, arguments); };

module.exports = DBReq;