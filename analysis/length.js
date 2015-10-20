#!/usr/bin/node
var lib = require('./lib.js');
var r = require('./initScene.js');

var reco = [
    r.createPeachRecommendations(),
    r.createBobombRecommendations(),
    r.createMountainRecommendations(),
    r.createWhompRecommendations()
];

function distanceBetweenPoints(pt1, pt2) {
    return (
        Math.sqrt(
            (pt2.x - pt1.x) * (pt2.x - pt1.x) +
            (pt2.y - pt1.y) * (pt2.y - pt1.y) +
            (pt2.z - pt1.z) * (pt2.z - pt1.z)
        )
    );
}

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

    var percentSum = 0;
    var eltNum = 0;

    for (var i = 0; i < db.experiments.length; i++) {

        var exp = db.experiments[i];

        if (exp.coinCombination.scene_id === 1 || exp.recommendation_style[4] === 'B' || !exp.finished || lib.coinsGot(exp) < 6) {
            continue;
        }

        eltNum++;

        var distance = 0;
        var distanceWithReco = 0;


        var j = 0;

        while (exp.elements.events[j].position === undefined) { j++; };

        var startPosition = exp.elements.events[j].position;
        j++;

        while (j < exp.elements.events.length) {

            var nextPosition, evt = exp.elements.events[j];

            if (evt.position === undefined && evt.type !== 'arrow') { j++; continue; }

            if (evt.type === 'arrow') {
                nextPosition = reco[exp.coinCombination.scene_id - 1][evt.id].position;
            } else {
                nextPosition = evt.position;
            }

            var tmp = distanceBetweenPoints(startPosition, nextPosition);

            if (evt.type === 'arrow') {
                distanceWithReco += tmp;
            }

            distance += tmp;

            startPosition = nextPosition;

            j++;

        }

        percentSum += 100 * distanceWithReco / distance;
        console.log(exp.id + ' -> ' + Math.floor(100 * distanceWithReco / distance) + '%');

    }

    console.log('Mean : ' + percentSum / eltNum);

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
