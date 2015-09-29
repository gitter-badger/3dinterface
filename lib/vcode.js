var hash = require('sha256');
var secretKey = require('../private.js').microSecretKey;

module.exports = function(campaignId, workerId) {

    return 'mw-' + hash(campaignId + workerId + secretKey);

}
