var pg = require('pg');
var pgc = require('../../private.js');
var Log = require('../../lib/NodeLog.js');

/**
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
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
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
    this.release();
    this.release = null;
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
        "SELECT coin_id, time FROM coinclicked WHERE exp_id = $1 ORDER BY time;",
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
                            id: result.rows[i].coin_id
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
        "SELECT arrow_id, time FROM arrowclicked WHERE exp_id = $1 ORDER BY time;",
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
                            id: result.rows[i].arrow_id
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
        "SELECT start, time, arrow_id FROM hovered WHERE exp_id = $1 ORDER BY time;",
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
                            id: result.rows[i].arrow_id
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
        "SELECT coin_id FROM coin WHERE exp_id = $1",
        [self.id],
        function(err, result) {
            if (err !== null) {
                Log.dberror(err + ' in loadRedCoins');
            } else {
                for (var i in result.rows) {
                    self.redCoins.push(result.rows[i].coin_id);
                }
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
DBReq.UserCreator = function(finishAction) {
    /**
     * Callback to call on the id when the user is created
     * @type {function}
     */
    this.finishAction = finishAction;

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
    this.client.query(
        "INSERT INTO users(name) VALUES('anonymous'); SELECT currval('users_id_seq');",
        [],
        function(err, result) {
            self.finalResult = result.rows[0].currval;
            self.finish();
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.UserCreator.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
};

/**
 * Class that creates an experiment
 * @param user_id {Number} id of the user that does the experiment
 * @param scene_id {Number} id of the scene the experiment is based on
 * @param finishAction {function} callback that has as a parameter the id of
 * the new experiment
 * @memberof DBReq
 * @constructor
 */
DBReq.ExpCreator = function(user_id, scene_id, finishAction) {
    this.finishAction = finishAction;
    this.user_id = user_id;
    this.scene_id = scene_id;

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
DBReq.ExpCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        "INSERT INTO experiment(user_id, scene_id) VALUES($1,$2);",
        [self.user_id, self.scene_id],
        function(err, result) {
            self.client.query("SELECT MAX(id) AS id FROM experiment;", function(err, result) {
                self.finalResult = result.rows[0].id;
                self.finish();
            });
        }
    );
};

/**
 * Release the DB connection and call the callback
 */
DBReq.ExpCreator.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
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
        "SELECT scene_id FROM experiment WHERE id = $1;",
        [self.id],
        function(err, result) {
            if (result === undefined || result.rows.length === 0) {
                self.finalResult = null;
            } else {
                self.finalResult = result.rows[0].scene_id;
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
            "experiment.id as exp_id, " +
            "users.name as username, " +
            "scene.name as scenename, " +
            "users.id as user_id " +
        "FROM experiment, users, scene " +
        "WHERE experiment.user_id = users.id and scene.id = experiment.scene_id " +
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
 * Try to get a user by id, and creates it if it doesn't exists
 * @param id {Number} id to test
 * @param callback {function} callback to call on the id
 * @memberof DBReq
 */
var tryUser = function(id, callback) {
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
module.exports.getInfo = function(id, callback) {
    new DBReq.Info(id, callback);
};

/**
 * Creates a user
 * @memberof DBReq
 * @param callback {function} callback called on the new user id
 */
module.exports.createUser = function(callback) {
    new DBReq.UserCreator(callback);
};

/**
 * Creates an experiment
 * @memberof DBReq
 * @param id {Number} id of the user doing the experiment
 * @param scene_id {Number} id of the scene on which the experiment is
 * @param callback {function} callback called on the new experiment id
 */
module.exports.createExp = function(id, scene_id, callback) {
    new DBReq.ExpCreator(id, scene_id, callback);
};

/**
 * Checks the user id
 * @memberof DBReq
 * @param id {Number} id to check
 * @param callback {function} callback called on a boolean (true if the user id
 * exists, false otherwise)
 */
module.exports.checkUserId = function(id, callback) {
    new DBReq.UserIdChecker(id, callback);
};

/**
 * Checks if an experiment id exists
 * @memberof DBReq
 * @param id {Number} id of the experiment to check
 * @param callback {function} callback called on an object (null if the
 * experiment doesn't exist, an object containing username, scene_id,
 * scenename, and exp_id if it exists
 */
module.exports.checkExpId = function(id, callback) {
    new DBReq.ExpIdChecker(id, callback);
};

/**
 * Gets a list of all experiments
 * @memberof DBReq
 * @param callback {function} callback called on an array containing all experiments
 */
module.exports.getAllExps = function(callback) {
    new DBReq.ExpGetter(callback);
};

module.exports.tryUser = tryUser;
