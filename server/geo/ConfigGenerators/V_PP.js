/**
 * Class that represents a generator that streams the frustum, and tries to preload recommendations that might be clicked
 * @constructor
 * @augments geo.ConfigGenerator
 * @param streamer {geo.MeshStreamer} the parent mesh streamer
 */
geo.V_PP_Generator = function() {

    geo.ConfigGenerator.apply(this, arguments);

};

geo.V_PP_Generator.prototype = Object.create(geo.ConfigGenerator);
geo.V_PP_Generator.prototype.constructor = geo.V_PP_Generator;

/**
 * Generates a config that streams partly the frustum, and splits the rest of the chunk among the recommendations that are likely to be clicked
 * @param cameraFrustum {Object} the frustum of the camera (with its position, target, and planes)
 * @returns {Object[]} an array with one element corresponding the camera frustum, and other for eventual recommendations to preload
 */
geo.V_PP_Generator.prototype.generateMainConfig = function(cameraFrustum) {

    var config;

    if (this.streamer.beginning === true) {

        console.log('Begining : full init');
        config = [{recommendationId : 0, proportion:1, smart: true}];

    } else {

        // Case full prefetch
        console.log("Allow some prefetching");

        didPrefetch = true;
        config = [{ frustum: cameraFrustum, proportion : this.streamer.frustumPercentage}];

        if (this.streamer.predictionTable !== undefined) {

            var sum = 0;

            for (var i = 1; i <= this.streamer.mesh.recommendations.length; i++) {

                sum += this.streamer.predictionTable[this.streamer.previousReco][i];

            }

            for (var i = 1; i <= this.streamer.mesh.recommendations.length; i++) {

                if (this.streamer.predictionTable[this.streamer.previousReco][i] > 0) {

                    config.push({

                        proportion : this.streamer.predictionTable[this.streamer.previousReco][i] * this.streamer.prefetchPercentage / sum,
                        recommendationId : i,
                        smart: true

                    });

                }

            }

        } else {

            process.stderr.write('ERROR : PREDICTION TABLE IF UNDEFINED');

        }

    }

    return config;

};

/**
 * Generates a config that depends on the previous configuration and that tries to fill the recommendations that were not already filled.
 * @param previousConfig {Object} the previous configuration list (that was launched on <code>generateMainConfig</code>
 * @param previousData {Object} the data that were given by the <code>nextElements</code> method on {@link geo.MeshStreamer}
 * @param cameraFrustum {Object} the frustum of the camera, containing its position, target and planes
 * @returns {Object[]} a configuration that tries to fill what was not filled before
 */
geo.V_PP_Generator.prototype.generateFillingConfig = function(previousConfig, previousData, cameraFrustum) {

    var sum = 0;
    var newConfig = [];

    for (var i = 0; i < previousConfig.length; i++) {

        // Check if previousConfig was full
        if (previousResult.configSizes[i] >= this.streamer.chunk * previousConfig[i].proportion) {

            newConfig.push(previousConfig[i]);
            sum += previousConfig[i].proportion;

        }

    }

    // Normalize previousConfig probabilities
    for (var i = 0; i < newConfig.length; i++) {

        newConfig[i].proportion /= sum;

    }

    return newConfig;

};
