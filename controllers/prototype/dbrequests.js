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

Info.prototype.merge = function() {
    this.finalResult = [];

    for (;;) {
        // Find next element
        var nextElement = null;
        var nextIndex = null;

        for (var i in this.results) {
            // The next element is placed at the index 0 (since the elements
            // gotten from the database are sorted)
            if (this.results[i].length !== 0 &&
                (nextElement === null || this.results[i][0].time < nextElement.time)) {
                nextElement = this.results[i][0];
                nextIndex = i;
            }
        }

        // If there is no next element, we're done
        if (nextElement === null) {
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
            "FROM keyboardevent WHERE user_id = $1 ORDER BY time;",
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
        "SELECT coin_id, time FROM coinclicked WHERE user_id = $1 ORDER BY time;",
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
        "SELECT arrow_id, time FROM arrowclicked WHERE user_id = $1 ORDER BY time;",
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
        "SELECT time FROM resetclicked WHERE user_id = $1 ORDER BY time;",
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
            "FROM previousnextclicked WHERE user_id = $1 ORDER BY time;",
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
        "SELECT start, time, arrow_id FROM hovered WHERE user_id = $1 ORDER BY time;",
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

var IdCreator = function(finishAction) {
    this.finishAction = finishAction;

    // Connect to db
    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

IdCreator.prototype.execute = function() {
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

IdCreator.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var IdChecker = function(id, finishAction) {
    this.id = id;
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

IdChecker.prototype.execute = function() {
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

IdChecker.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

var UserGetter = function(finishAction) {
    this.finishAction = finishAction;

    var self = this;
    pg.connect(pgc.url, function(err, client, release) {
        self.client = client;
        self.release = release;
        self.execute();
    });
}

UserGetter.prototype.execute = function() {
    var self = this;
    this.client.query(
        "SELECT id, name FROM users",
        [],
        function(err, result) {
            self.finalResult = result.rows;
            self.finish();
        }
    );
}

UserGetter.prototype.finish = function() {
    this.release();
    this.client = null;
    this.release = null;

    this.finishAction(this.finalResult);
}

module.exports.getInfo      = function(id, callback) { new Info(id, callback);      };
module.exports.createId     = function(callback)     { new IdCreator(callback);     };
module.exports.checkId      = function(id, callback) { new IdChecker(id, callback); };
module.exports.getAllUsers  = function(callback)     { new UserGetter(callback);    };
