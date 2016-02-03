module Proto {

    /**
     * Class that represents a scene that can contains recommendations and coins
     * @constructor
     * @augments {L3D.Scene}
     */
    export abstract class SceneWithCoins extends L3D.Scene {

        coins : Coin[];
        coinScale : number;

        static coins : L3D.Vector3[];

        constructor() {

            super();

            this.coins = [];
            this.coinScale = 0.005;

        }

        /**
         * Adds coins to the scene
         * @param coinConfig Object that contains a type attribute (being
         * Coin.Config.{None, Some, All}) and a ids attribute being an array of ids
         * of coins
         */
        addCoins (coinConfig : CoinConfig, coinScale ?: number) {

            if (typeof coinScale === 'number') {
                this.coinScale = coinScale;
            }

            if (typeof coinConfig.visible !== 'boolean') {
                coinConfig.visible = true;
            }

            switch (coinConfig.type) {

                case ConfigType.None:

                    // No coin to add
                    break;

                case ConfigType.Some:
                    case ConfigType.All:

                    var arr : L3D.Vector3[];

                if (coinConfig.type === ConfigType.Some) {
                    // Get only the coordinates for ids that are requested
                    var self = this;
                    arr = coinConfig.ids.map((i : number) => (<typeof SceneWithCoins>this.constructor).coins[i]);
                } else {
                    // Get all coins coordinates
                    arr = (<typeof SceneWithCoins>this.constructor).coins;
                }

                // Add coins to scene
                for (var i = 0; i < arr.length; i++) {
                    var coin = new Coin(arr[i], this.coinScale);
                    this.add(coin);
                    coin.visible = coinConfig.visible;
                    this.coins.push(coin);
                    this.clickableObjects.push(coin);
                }

                break;

            }

        }

        setCoinsVisibility(b = true) {

            this.coins.forEach((c : THREE.Object3D) => { c.visible = b; });

        }

        abstract getRawRecommendations() : L3D.CameraItf[];

        abstract getRawCoins() : L3D.Vector3[];

    }

}
