var pg = require('pg');
var pgc = require('../../private.js');

var Info = function(id, finishAction) {
    this.id = id;

    this.ready = {
        cameras: false,
        coins: false,
        arrows: false,
        resets : false,
        previousNext: false,
        hovered: false
    };

    this.results = {};
    this.finishAction = finishAction;

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

Info.prototype.execute = function() {
    this.loadCameras();
    this.loadCoins();
    this.loadArrows();
    this.loadResets();
    this.loadPreviousNext();
    this.loadHovered();
}

Info.prototype.tryMerge = function() {
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
}

// Merges the results of every SQL requests done by the load... methods
Info.prototype.merge = function() {
    this.finalResult = [];

    for (;;) {
        // Find next element
        var nextIndex = null;

        for (var i in this.results) {
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
        this.finalResult.push(this.results[nextIndex].shift());
    }
}

Info.prototype.loadCameras = function() {
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
            self.ready.cameras = true;
            self.tryMerge();
        }
    );
}

Info.prototype.loadCoins = function() {
    var self = this;
    this.client.query(
        "SELECT coin_id, time FROM coinclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err,result) {
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
            self.ready.coins = true;
            self.tryMerge();
        }
    );
}

Info.prototype.loadArrows = function() {
    var self = this;
    this.client.query(
        "SELECT arrow_id, time FROM arrowclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
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
            self.ready.arrows = true;
            self.tryMerge();
        }
    );
}

Info.prototype.loadResets = function() {
    var self = this;
    this.client.query(
        "SELECT time FROM resetclicked WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
            self.results.resets = [];
            for (var i in result.rows) {
                self.results.resets.push(
                    {
                        type: 'reset',
                        time: result.rows[i].time
                    }
                );
            }
            self.ready.resets = true;
            self.tryMerge();
        }
    );
}

Info.prototype.loadPreviousNext = function () {
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
            self.ready.previousNext = true;
            self.tryMerge();
        }
    );
}

Info.prototype.loadHovered = function() {
    var self = this;
    this.client.query(
        "SELECT start, time, arrow_id FROM hovered WHERE exp_id = $1 ORDER BY time;",
        [self.id],
        function(err, result) {
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
            self.ready.hovered = true;
            self.tryMerge();
        }
    );
}

var UserCreator = function(finishAction) {
    this.finishAction = finishAction;

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

UserCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        "INSERT INTO users(name) VALUES('anonymous'); SELECT currval('users_id_seq');",
        [],
        function(err, result) {
            self.finalResult = result.rows[0].currval;
            self.finish();
        }
    );
}

UserCreator.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var ExpCreator = function(user_id, finishAction) {
    this.finishAction = finishAction;
    this.user_id = user_id;

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

ExpCreator.prototype.execute = function() {
    var self = this;
    this.client.query(
        // TODO this is ugly, we should not do that...
        "INSERT INTO experiment(user_id, scene_id) VALUES(" + this.user_id + " , 1); SELECT currval('experiment_id_seq');",
        [],
        function(err, result) {
            self.finalResult = result.rows[0].currval;
            self.finish();
        }
    );
}

ExpCreator.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var UserIdChecker = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

UserIdChecker.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT count(id) > 0 AS answer FROM users WHERE id = $1;",
        [self.id],
        function(err, result) {
            self.finalResult = result.rows[0].answer;
            self.finish();
        }
    );
}

UserIdChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var ExpIdChecker = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

ExpIdChecker.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT count(id) > 0 AS answer FROM experiment WHERE id = $1;",
        [self.id],
        function(err, result) {
            self.finalResult = result.rows[0].answer;
            self.finish();
        }
    );
}

ExpIdChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var ExpGetter = function(finishAction) {
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

ExpGetter.prototype.execute = function() {
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
}

ExpGetter.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var tryUser = function(id, callback) {
    if (id !== undefined && id !== null) {
        new UserIdChecker(id, function(clear) {
            if (clear) {
                callback(id);
            } else {
                new UserCreator(callback);
            }
        });
    } else {
        new UserCreator(callback);
    }
}

module.exports.getInfo      = function(id, callback) { new Info(id, callback);          };
module.exports.createUser   = function(callback)     { new UserCreator(callback);       };
module.exports.createExp    = function(id, callback) { new ExpCreator(id, callback);    };
module.exports.checkUserId  = function(id, callback) { new UserIdChecker(id, callback); };
module.exports.checkExpId   = function(id, callback) { new ExpIdChecker(id, callback);  };
module.exports.getAllExps   = function(callback)     { new ExpGetter(callback);         };
module.exports.tryUser = tryUser;
