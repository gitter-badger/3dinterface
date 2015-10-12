#!/usr/bin/node
// Shows with and without : time to last coin = f(CoinCombination)

var lib = require('./lib.js');


function main(path) {

    var db = lib.loadFromFile(path);
    var groups = lib.makeGroups(db);

    // Erase groups that are not usable
    groups = groups.filter(function(elt) {

        // An elt is valid if it contains at least 2 exp, BaseRecommendation included
        return elt.length > 1 && elt.find(function(e) { return e.recommendation_style[4] === 'B'; }) !== undefined;

    });

    groups.forEach(function(elt) {
        elt.sort(lib.compareRecommendationStyle);
    });

    console.log(lib.toMatlabArray('X', lib.range(0, groups.length)));

    console.log(lib.toMatlabArray('Y1', lib.range(0, groups.length, function(i) {
        return lib.experimentDuration(groups[i][0]);
    })));

    console.log(lib.toMatlabArray('Y2', lib.range(0, groups.length, function(i) {
        return lib.max(lib.experimentDuration(groups[i][1]), lib.experimentDuration(groups[i][2]));
    })));

    console.log(lib.toMatlabArray('Y3', lib.range(0, groups.length, function(i) {
        return lib.min(lib.experimentDuration(groups[i][1]), lib.experimentDuration(groups[i][2]));
    })));

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2]);

