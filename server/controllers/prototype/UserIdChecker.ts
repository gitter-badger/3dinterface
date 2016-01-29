import pg = require('pg');

import pgc = require('../../private');
import Log = require('../../lib/log');

/**
 * Class that checks if an user id exists
 */
export = class UserIdChecker {

    id : number;
    finishAction : (a : any) => void;
    client : pg.Client;
    finalResult : any;
    release : () => void;

    /**
     * @param id {Number} id of the user to check
     * @param finishAction {function} callback that has as a parameter which is a
     * boolean indicating wether the user id exists or not
     * @memberof DBReq
     * @constructor
     * @private
     */
    constructor(id : number, finishAction : (a : any) => void) {
        this.id = id;
        this.finishAction = finishAction;

        pg.connect(pgc.url, (err : Error, client : pg.Client, release : () => void) => {
            this.client = client;
            this.release = release;
            this.execute();
        });

    }

    /**
     * Executes the SQL request and calls the callback
     */
    execute() {
        this.client.query(
            "SELECT count(id) > 0 AS answer FROM users WHERE id = $1;",
            [this.id],
            (err : Error, result : pg.QueryResult) => {
                if (err !== null) {
                    Log.dberror(err + ' in UserIdChecker');
                    return;
                }
                this.finalResult = result.rows[0].answer;
                this.finish();
            }
        );
    }

    /**
     * Release the DB connection and call the callback
     */
    finish() {
        this.release();
        this.client = null;
        this.release = null;

        this.finishAction(this.finalResult);
    }

}