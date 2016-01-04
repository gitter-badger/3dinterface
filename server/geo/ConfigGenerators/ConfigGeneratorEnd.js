/**
 * Creates a configuration generator from a string that can be 'NV-PN', 'V-PP', 'V-PD', or 'V-PP-PD'
 * @param prefetchingPolicy {String} the string corresponding to the prefetching policy
 * @param streamer {Reference to the {@link geo.MeshStreamer}
 * @return {geo.ConfigGenerator} An instance of one of the subclasses of {@link geo.ConfigGenerator}
 */
geo.ConfigGenerator.createFromString = function(prefetchingPolicy, streamer) {

    // Convert arguments into an array
    var args = Array.prototype.slice.call(arguments);
    args[0] = null;

    // Shift that array in order to create a generator easily
    switch (prefetchingPolicy) {
        case 'NV-PN':    return new (Function.prototype.bind.apply(geo.NV_PN_Generator,args));
        case 'V-PD':     return new (Function.prototype.bind.apply(geo.V_PD_Generator,args));
        case 'V-PP':     return new (Function.prototype.bind.apply(geo.V_PP_Generator,args));
        case 'V-PP-PD':  return new (Function.prototype.bind.apply(geo.V_PP_PD_Generator,args));
        default:
            process.stderr.write('Warning : prefetch type not recognized, using default...\n');
            return new geo.ConfigGenerator();
    }

};
