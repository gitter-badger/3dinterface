var lib = require('./lib.js');

function main(path) {

    var db = lib.loadFromFile(path);
    var groups = lib.makeGroups(db);

    console.log(`There were ${db.users.length} users for ${db.experiments.length} experiments`);

    var meanTimeNoReco = 0;
    var meanTimeArrow = 0;
    var meanTimeViewport = 0;


    groups.forEach(function(elt) {
        var ok = true;

        // console.log(elt);
        elt.sort(compareRecommendationStyle);
        // console.log(elt);

        elt.forEach(function(subElt) {
            if (subElt.coin_combination_id !== elt[0].coin_combination_id) {
                ok = false;
            }
        });

        if (!ok) {
            process.stderr.write('Error : assertion failed');
            process.exit(-1);
        }

        console.log(elt.length + ' -> ' + elt[0].coin_combination_id);
    });

    console.log('-----------------');

    var value = minDifferences(groups);
    console.log(value);

}

function minDifference(exps) {

    var dict = {};

    exps.forEach(function(subElt) {
        dict[subElt.recommendation_style[4]] = subElt.duration;
    });

    if (dict.B !== undefined) {

        if (dict.A !== undefined && dict.V !== undefined) {
            return (
                Math.min(dict.A - dict.B, dict.V - dict.B)
            );
        }

        if (dict.A !== undefined) {
            return dict.A - dict.B;
        }

        if (dict.V !== undefined) {
            return dict.V - dict.B;
        }
    }

}

function minDifferences(groups) {

    var differences = [];

    groups.forEach(function(elt) {

        var timesMean = 0;

        elt.forEach(function(elt) {
            var duration = experimentDuration(elt);
            timesMean += experimentDuration(elt);
        });

        timesMean /= elt.length;

        var normalizedElt = [];

        elt.forEach(function(subElt) {
            normalizedElt.push({
                recommendation_style : subElt.recommendation_style,
                duration : experimentDuration(subElt) / timesMean
            });
        });

        var diff = minDifference(normalizedElt);

        if (diff !== undefined)
            differences.push(diff);
    });

    var sum = 0;

    differences.forEach(function(elt) {
        sum += elt;
    });

    return sum / differences.length;

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
