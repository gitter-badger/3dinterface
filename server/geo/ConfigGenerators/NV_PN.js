/**
 * Class that represents a generator that streams first the frustum of the
 * camera, and then linearly according to the .obj file
 * @constructor
 * @augments geo.ConfigGenerator
 * @param streamer {geo.MeshStreamer} the parent mesh streamer
 */
geo.NV_PN_Generator = function(streamer) {

    geo.ConfigGenerator.apply(this, arguments);

};

geo.NV_PN_Generator.prototype = Object.create(geo.ConfigGenerator);
geo.NV_PN_Generator.prototype.constructor = geo.NV_PN_Generator;

/**
 * Generates a configuration with only the camera frustum, with proportion of 1
 * @returns {Object[]} an array with one element corresponding to the camera frustum
 */
geo.NV_PN_Generator.prototype.generateMainConfig = function(cameraFrustum, recommendationClicked) {

    var config;

    // Case without prefetch
    console.log("No prefetching");
    config = [{ frustum: cameraFrustum, proportion: 1}];

    return config;
};

/**
 * Generates an empty configuration
 * @returns {Object[]} an empty array
 */
geo.NV_PN_Generator.prototype.generateFillingConfig = function(previousConfig, previousData, cameraFrustum, recommendationClicked) {

    return [];

};
