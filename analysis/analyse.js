// http://codereview.stackexchange.com/questions/37028/grouping-elements-in-array-by-multiple-properties
function groupBy(array, f)
{
    var groups = {};
    array.forEach(function(o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return Object.keys(groups).map(function(group) {
        return groups[group];
    })
}

function compareRecommendationStyle(style1, style2) {

    if (style1.recommendation_style[4] === 'B' && style2.recommendation_style[4] !== 'B') {
        return -1;
    }

    if (style2.recommendation_style[4] === 'B' && style1.recommendation_style[4] !== 'B') {
        return 1;
    }

    if (style1.recommendation_style[4] === 'V' && style2.recommendation_style[4] === 'A') {
        return -1;
    }

    if (style2.recommendation_style[4] === 'V' && style1.recommendation_style[4] === 'A') {
        return 1;
    }

    return 0;

}

function main(path) {

    var db = JSON.parse(require('fs').readFileSync(path, 'utf8'));

    console.log(`There were ${db.users.length} users for ${db.experiments.length} experiments`);

    var meanTimeNoReco = 0;
    var meanTimeArrow = 0;
    var meanTimeViewport = 0;

    var groups = makeGroups(db);

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

    // for (var i = 0; i < db.experiments.length; i++) {

    //     var exp = db.experiments[i];
    //     var events = exp.elements.events;

    //     if (events.length === 0 || exp.user.worker_id === null) {

    //         continue;

    //     }

    //     var coins = [];
    //     for (var j = 0; j < exp.elements.events.length; j++) {

    //         if (exp.elements.events[j].type === 'coin') {

    //             if (coins.find(function(elt) { return elt.id === exp.elements.events[j].id; }) === undefined) {

    //                 coins.push(exp.elements.events[j]);

    //             }

    //         }

    //     }
    //     console.log(`${exp.id} -> ${coins.length} (on ${exp.coinCombination.scene_id} )`);
    // }

    // console.log();

    // for (var i = 0; i < db.users.length; i++) {

    //     var user = db.users[i];
    //     console.log(`${user.worker_id} has done ${user.experiments.length} experiments with rating ${user.rating}`);

    // }

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

function experimentDuration(exp) {
    var lastCoin = null;

    for (var i = exp.elements.events.length - 1; i >= 0; i--) {
        if (exp.elements.events[i].type === 'coin') {
            lastCoin = exp.elements.events[i];
            break;
        }
    }

    return timeDifference(exp.elements.events[0].time, lastCoin.time);

}

function timeDifference(time1, time2) {

    return new Date(time2).getTime() - new Date(time1).getTime();

}

function timeToString(_time) {

    var time = _time / 1000;

    return Math.floor(time / 3600) + 'h' + Math.floor((time % 3600) / 60) + 'm' + Math.floor(time % 60);

}

function makeGroups(db) {

    var elements = [];

    for (var i = 0; i < db.experiments.length; i++) {

        if (db.experiments[i].coinCombination.scene_id !== 1 && db.experiments[i].elements.events.length !== 0) {

            elements.push(db.experiments[i]);

        }

    }

    return groupBy(elements, function(item) {
        return item.coin_combination_id;//, item.user.rating];
    });

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
