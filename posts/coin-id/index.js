var pg = require('pg');
var secret = require('../../private');
var Log = require('../../lib/NodeLog.js');

function insertCoinId(client, release, exp_id, coin_ids) {

    if (coin_ids.length > 0) {
        client.query(
            'INSERT INTO Coin(exp_id, coin_id) VALUES ($1, $2);',
            [exp_id,coin_ids.shift()],
            function(err, result) {
                if (err !== null)
                    Log.dberror(err + ' coin-id');

                if (coin_ids.length === 0)
                    release();
                else
                    insertCoinId(client, release, exp_id, coin_ids);
            }
        );
    }
}

module.exports.index = function(req, res) {

    pg.connect(secret.url, function(err, client, release) {
        insertCoinId(client, release, req.session.exp_id, req.body.indices);
    });

    res.setHeader('Content-Type', 'text/html');
    res.send("");
};
