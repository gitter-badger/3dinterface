/**
 * Creates an empty config generator (generating always empty configs)
 * @constructor
 * @param streamer {geo.MeshStreamer} the parent mesh streamer
 */
geo.ConfigGenerator = function(streamer) {

    this.streamer = streamer;
    this.beginning = true;

};

/**
 * Generates an empty configuration
 * @return {Object[]} an empty array
 */
geo.ConfigGenerator.prototype.generateMainConfig = function() {

    process.stderr.write('Warning : empty config generator used\n');
    return [];

};

/**
 * Generates an empty configuration
 * @return {Object[]} an empty array
 */
geo.ConfigGenerator.prototype.generateFillingConfig = function() {

    process.stderr.write('Warning : empty config generator used\n');
    return [];

};
