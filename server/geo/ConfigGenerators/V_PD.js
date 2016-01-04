/**
 * Class that represents a generator that streams the recommendation clicked if any, of the frustum
 * @constructor
 * @augments geo.ConfigGenerator
 * @param streamer {geo.MeshStreamer} the parent mesh streamer
 */
geo.V_PD_Generator = function() {

    geo.ConfigGenerator.apply(this, arguments);

};

geo.V_PD_Generator.prototype = Object.create(geo.ConfigGenerator);
geo.V_PD_Generator.prototype.constructor = geo.V_PD_Generator;

/**
 * Generates a config that streams everything on the recommendation clicked if any, or full on the frustum
 * @param cameraFrustum {Object} the frustum of the camera (with its position, target, and planes)
 * @param recommendationClicked {Number|null} id of the recommendation (can be null if no recommendations are clicked)
 * @returns {Object[]} an array with one element corresponding to the recommendation clicked, or the camera frustum if there are no recommendations clicked
 */
geo.V_PD_Generator.prototype.generateMainConfig = function(cameraFrustum, recommendationClicked) {

    var config;
    if (recommendationClicked != null) {

        if (this.streamer.beginning === true) {
            this.streamer.beginning = false;
        }

        // Case full reco
        console.log("Going to " + recommendationClicked);
        console.log("Recommendation is clicking : full for " + JSON.stringify(this.streamer.mesh.recommendations[recommendationClicked].position));
        config = [{recommendationId : recommendationClicked + 1, proportion: 1, smart:true}];

    } else if (this.streamer.beginning === true) {

        console.log('Begining : full init');
        config = [{recommendationId : 0, proportion:1, smart: true}];


    } else {

        // Case without prefetch
        console.log("No prefetching");
        config = [{ frustum: cameraFrustum, proportion: 1}];

    }

    return config;
};

/**
 * Generates a configuration with only the camera frustum, with proportion of 1
 * @returns {Object[]} an array with one element corresponding to the camera frustum
 */
geo.V_PD_Generator.prototype.generateFillingConfig = function() {

    return [{proportion:1, frustum: cameraFrustum}];

};
