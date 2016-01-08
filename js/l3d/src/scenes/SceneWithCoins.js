/**
 * Class that represents a scene that can contains recommendations and coins
 * @constructor
 * @augments {L3D.Scene}
 */
var SceneWithCoins = function() {

    L3D.Scene.apply(this, arguments);

    this.coins = [];
    this.coinScale = 0.005;

};

SceneWithCoins.prototype = Object.create(L3D.Scene.prototype);
SceneWithCoins.prototype.constructor = SceneWithCoins;

/**
 * Adds coins to the scene
 * @param {Object} coinConfig Object that contains a type attribute (being Coin.Config.{NONE, SOME, ALL}) and a ids attribute being an array of ids of coins
 */
SceneWithCoins.prototype.addCoins = function (coinConfig, coinScale) {

    if (typeof coinScale === 'number') {
        this.coinScale = coinScale;
    }

    if (typeof coinConfig.visible !== 'boolean') {
        coinConfig.visible = true;
    }

    switch (coinConfig.type) {

        case Coin.Config.NONE:

            // No coin to add
            break;

        case Coin.Config.SOME:
        case Coin.Config.ALL:

            var arr;
            if (coinConfig.type === Coin.Config.SOME) {
                // Get only the coordinates for ids that are requested
                var self = this;
                arr = coinConfig.ids.map(function(i) {return self.constructor.coins[i];});
            } else {
                // Get all coins coordinates
                arr = this.constructor.coins;
            }

            // Add coins to scene
            for (var i = 0; i < arr.length; i++) {
                var coin = new Coin(arr[i], this.coinScale);
                coin.addToScene(this);
                coin.visible = coinConfig.visible;
                this.coins.push(coin);
                this.clickableObjects.push(coin);
            }

            break;

    }

};

SceneWithCoins.prototype.setCoinsVisibility = function(b) {

    this.coins.forEach(function(c) { c.visible = b; });

};
