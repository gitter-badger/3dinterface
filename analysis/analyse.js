#!/usr/bin/node
var lib = require('./lib.js');

function main(path) {

    var db = lib.loadFromFile(path);
    var groups = lib.makeGroups(db);

    // Erase groups that are not usable
    var invalid = 0;
    groups = groups.filter(function(elt) {

        // An elt is valid if it contains at least 2 exp, BaseRecommendation included
        if (elt.length > 1 && elt.find(function(e) { return e.recommendation_style[4] === 'B'; }) !== undefined) {
            return true
        } else {
            invalid++;
            return false;
        }

    });

    groups.forEach(function(elt) {
        elt.sort(lib.compareRecommendationStyle);
    });

    var nbExp = 0;

    groups.forEach(function(elt) {
        nbExp += elt.length;
    });

    console.log(`There were ${db.users.length} users for ${nbExp} experiments (${invalid} invalid)`);
    console.log(`There were ${groups.length} groups that were made.`);

    groups.forEach(function(elt) {
        console.log(elt.length);
    });

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
