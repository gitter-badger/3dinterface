var hash = require('sha256');
var secretKey = require('../private.js').microSecretKey;
var campaignId = require('../private.js').microCampaignId;

module.exports = function(workerId) {

    return 'mw-' + hash(campaignId + workerId + secretKey);

}
