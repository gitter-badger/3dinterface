var hash = require('sha256');
var secretKey = require('../private.js').microSecretKey;
var campaignId = require('../private.js').microCampaignId;

export = function(workerId : string) : string {

    return 'mw-' + hash(campaignId + workerId + secretKey);

};
