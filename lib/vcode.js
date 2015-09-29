var hash = require('sha256');
var secretKey = require('../private.js').microSecretKey;

module.exports = function(workerId, campaignId) {

    if (campaignId === undefined) {

        return 'mw-dummyvcode';

    }

    return 'mw-' + hash(campaignId + workerId + secretKey);

}
