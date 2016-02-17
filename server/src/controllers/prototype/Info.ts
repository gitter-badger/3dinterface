import pg = require('pg');

import pgc = require('../../private');
import Log = require('../../lib/log');

import async = require('async');

module DBReq {

    /**
     * A class that loads every information from an experiment
     * finished
     * @private
     */
    export class Info {

        /**
         * Id of the experiment to log
         */
        id : number;

        /**
         * Map between each element to load and a boolean saying if the element has
         * been already loaded
         */
        ready : {
            [id : string] : boolean,
            cameras: boolean,
            coins: boolean,
            arrows: boolean,
            resets : boolean,
            previousNext: boolean,
            hovered: boolean,
            pointerLocked: boolean,
            switchedLockOption: boolean,
            redCoins: boolean,
            sceneInfo: boolean
        };

        /**
         * List of the ids of the coins involved in the experiment
         */
        redCoins : number[];

        /**
         * Final result of all SQL requests
         */
        finalResult : any;

        /**
         * Container of the result
         */
        results : any;

        /**
         * Callback to call on finalResult when the loading is complete
         */
        finishAction : Function;

        /**
         * Client of connection to databse
         */
        client : pg.Client;

        /**
         * Function that releases the client to database
         */
        release : Function;

        /**
         * @param id id of the experiment to load
         * @param finishAction callback on the result when loading is
         */
        constructor(id : number, finishAction : (a:any) => void) {

            this.id = id;

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

            this.redCoins = [];
            this.results = {};
            this.finishAction = finishAction;
            this.client = null;

            this.release = null;

            // Connect to db
            this.client = new pg.Client(pgc.url);

            this.client.connect(() => { this.execute(); });

        }

        /**
         * Loads everything async
         */
        execute() {
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
        }

        /**
         * Checks if everything is loaded, and if so merges the results and call the
         * final callback
         */
        tryMerge() {

            // If not ready, do nothing
            for (let i in this.ready) {
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

        }

        /**
         * Merges the results of the different SQL requests and prepare final result.
         */
        merge() {

            this.finalResult = {redCoins : [], events : []};

            for (;;) {
                // Find next element
                let nextIndex : number = null;

                for (let index = 0; index < this.results.length; index++) {
                    let i = this.results[index];
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
            for (let i = 0; i < this.redCoins.length; i++) {
                this.finalResult.redCoins.push(this.redCoins[i]);
            }

        }

        /**
         * Launches the SQL request to load the camera information from the DB and
         * tries to merge when finished
         */
        loadCameras() {

            this.client.query(
                "SELECT ((camera).position).x AS px, " +
                    "((camera).position).y AS py, " +
                    "((camera).position).z AS pz, " +
                    "((camera).target).x   AS tx, " +
                    "((camera).target).y   AS ty, " +
                    "((camera).target).z   AS tz, " +
                    "time                  AS time " +
                    "FROM keyboardevent WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadCameras');
                    } else {
                        this.results.cameras = [];
                        for (let i in result.rows) {
                            this.results.cameras.push(
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
                    this.ready.cameras = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the coin information from the DB and
         * tries to merge when finished
         */
        loadCoins() {
            this.client.query(
                "SELECT coin_id AS \"coinId\", time FROM coinclicked WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err,result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadCoins');
                    } else {
                        this.results.coins = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.coins.push(
                                {
                                    type: 'coin',
                                    time: result.rows[i].time,
                                    id: result.rows[i].coinId
                                }
                            );
                        }
                    }
                    this.ready.coins = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the recommendation information from the DB and
         * tries to merge when finished
         */
        loadArrows() {
            this.client.query(
                "SELECT arrow_id AS \"arrowId\", time FROM arrowclicked WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadArrows');
                    } else {
                        this.results.arrows = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.arrows.push(
                                {
                                    type: 'arrow',
                                    time: result.rows[i].time,
                                    id: result.rows[i].arrowId
                                }
                            );
                        }
                    }
                    this.ready.arrows = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the reset information from the DB and
         * tries to merge when finished
         */
        loadResets() {
            this.client.query(
                "SELECT time FROM resetclicked WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadResets');
                    } else {
                        this.results.resets = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.resets.push(
                                {
                                    type: 'reset',
                                    time: result.rows[i].time
                                }
                            );
                        }
                    }
                    this.ready.resets = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the previous / next information from the DB and
         * tries to merge when finished
         */
        loadPreviousNext() {
            this.client.query(
                "SELECT ((camera).position).x AS px, " +
                    "((camera).position).y AS py, " +
                    "((camera).position).z AS pz, " +
                    "((camera).target).x   AS tx, " +
                    "((camera).target).y   AS ty, " +
                    "((camera).target).z   AS tz, " +
                    "time                  AS time " +
                    "FROM previousnextclicked WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadPreviousNext');
                    } else {
                        this.results.previousNext = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.previousNext.push(
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
                    this.ready.previousNext = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the hovered information from the DB and
         * tries to merge when finished
         */
        loadHovered() {
            this.client.query(
                "SELECT start, time, arrow_id AS \"arrowId\" FROM hovered WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadHovered');
                    } else {
                        this.results.hovered = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.hovered.push(
                                {
                                    type: "hovered",
                                    time: result.rows[i].time,
                                    start: result.rows[i].start,
                                    id: result.rows[i].arrowId
                                }
                            );
                        }
                    }
                    this.ready.hovered = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the pointer lock information from the DB and
         * tries to merge when finished
         */
        loadPointerLocked() {
            this.client.query(
                "SELECT time, locked FROM pointerlocked WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadPointerLocked');
                    } else {
                        this.results.pointerlocked = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.pointerlocked.push(
                                {
                                    type: "pointerlocked",
                                    locked: result.rows[i].locked,
                                    time: result.rows[i].time
                                }
                            );
                        }
                    }
                    this.ready.pointerLocked = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the switch pointer lock option information
         * from the DB and tries to merge when finished
         */
        loadSwitchedLockOption() {
            this.client.query(
                "SELECT time, locked FROM switchedlockoption WHERE exp_id = $1 ORDER BY time;",
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadSwitchedLockOption');
                    } else {
                        this.results.switchedlockoption = [];
                        let i = 0;
                        for (; i < result.rows.length; i++) {
                            this.results.switchedlockoption.push(
                                {
                                    type: "switchedlockoption",
                                    locked: result.rows[i].locked,
                                    time:  result.rows[i].time
                                }
                            );
                        }
                    }
                    this.ready.switchedLockOption = true;
                    this.tryMerge();
                }
            );
        }

        /**
         * Launches the SQL request to load the coins used in the expermient from the
         * DB and tries to merge when finished
         */
        loadRedCoins() {
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
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadRedCoins');
                    } else {
                        this.redCoins.push(result.rows[0].coin1);
                        this.redCoins.push(result.rows[0].coin2);
                        this.redCoins.push(result.rows[0].coin3);
                        this.redCoins.push(result.rows[0].coin4);
                        this.redCoins.push(result.rows[0].coin5);
                        this.redCoins.push(result.rows[0].coin6);
                        this.redCoins.push(result.rows[0].coin7);
                        this.redCoins.push(result.rows[0].coin8);
                    }
                    this.ready.redCoins = true;
                    this.tryMerge();
                }
            );
        }

        loadSceneInfo() {
            this.client.query(
                'SELECT Experiment.recommendation_style AS "recommendationStyle", \n' +
                    '       CoinCombination.scene_id AS "sceneId" \n' +
                    'FROM Experiment, CoinCombination \n' +
                    'WHERE Experiment.coin_combination_id = CoinCombination.id AND Experiment.id = $1;',
                [this.id],
                (err, result) => {
                    if (err !== null) {
                        Log.dberror(err + ' in loadSceneInfo');
                    } else {
                        this.finalResult.sceneInfo = {
                            recommendationStyle : result.rows[0].recommendationStyle,
                            sceneId : result.rows[0].sceneId
                        };
                    }
                    this.ready.sceneInfo = true;
                    this.tryMerge();
                }
            );
        };

    }

}

export = DBReq;
