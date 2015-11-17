var Lib = module.exports;

// http://codereview.stackexchange.com/questions/37028/grouping-elements-in-array-by-multiple-properties
Lib.groupBy = function(array, f) {
    var groups = {};
    array.forEach(function(o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });

    return Object.keys(groups).map(function(group) {
        return groups[group];
    });
};

function letterToInt(letter) {
    switch (letter) {
        case 'B': return 0;
        case 'V': return 1;
        case 'A': return 2;
        default : return null;
    }
}

Lib.compareRecommendationStyle = function(style1, style2) {

    return letterToInt(style1.recommendation_style[4]) - letterToInt(style2.recommendation_style[4]);

};

Lib.experimentDuration = function(exp) {

    if (exp === undefined) {

        return;

    }

    var lastCoin = null;

    for (var i = exp.elements.events.length - 1; i >= 0; i--) {
        if (exp.elements.events[i].type === 'coin') {
            lastCoin = exp.elements.events[i];
            break;
        }
    }

    if (lastCoin === null) {
        console.log(exp.id);
    }

    if (Lib.coinsGot(exp) === 8)
        return Lib.timeDifference(exp.elements.events[0].time, lastCoin.time);
    else
        return Lib.timeDifference(
            exp.elements.events[0].time,
            exp.elements.events[exp.elements.events.length-1].time
        );

};

Lib.max = function(elt1, elt2) {

    if (elt1 === undefined)
        return elt2;

    if (elt2 === undefined)
        return elt1;

    return Math.max(elt1,elt2);

};

Lib.min = function(elt1, elt2) {

    if (elt1 === undefined)
        return elt2;

    if (elt2 === undefined)
        return elt1;

    return Math.min(elt1,elt2);

};

Lib.timeDifference = function(time1, time2) {

    return new Date(time2).getTime() - new Date(time1).getTime();

};

Lib.timeToString = function(_time) {

    var time = _time / 1000;

    return Math.floor(time / 3600) + 'h' + Math.floor((time % 3600) / 60) + 'm' + Math.floor(time % 60);

};

Lib.coinsGot = function(exp) {
    var counter = 0;

    for (var i = 0; i < exp.elements.events.length; i++) {

        if (exp.elements.events[i].type === 'coin') {

            counter ++;

        }
    }

    return counter;
}

Lib.makeGroups = function(db) {

    var elements = [];

    for (var i = 0; i < db.experiments.length; i++) {

        if (db.experiments[i].coinCombination.scene_id !== 1 && db.experiments[i].elements.events.length !== 0) {

            if (db.experiments[i].finished === true && Lib.coinsGot(db.experiments[i]) > 5) {

                if (db.experiments[i].user === undefined) {
                    db.experiments[i].user = {};
                }

                elements.push(db.experiments[i]);

                // }

            }

        }

    }

    return Lib.groupBy(elements, function(item) {
        return item.coin_combination_id;//, item.user.rating];
    });

};

Lib.loadFromFile = function(path) {

    return JSON.parse(require('fs').readFileSync(path, 'utf8'));

};

Lib.toMatlabArray = function(name, array) {

    var str = name + ' = [ ';

    array.forEach(function(elt) { str += ' ' + elt + ' '; });

    str += '];\n';

    return str;

};

Lib.toLaTeXCoordinate = function(name, array) {
    var str = '\\addplot coordinates {';

    for (var i = 0; i < array.length; i++) {

        str += '(' + i + ',' + array[i] + ') ';

    }

    return str + '};\n';

}

// http://stackoverflow.com/questions/3895478/
Lib.range = function(start, stop, step, computation) {

    if (typeof step === 'function') {

        computation = step;
        step = 1;

    }

    if (computation === undefined) {

        computation = function(i) { return i; };

    }

    if (step === undefined) {

        step = 1;

    }

    var a = [];
    while (start < stop) {
        var e = computation(start);
        if (e === undefined)
            e = NaN;
        a.push(e);
        start += step;
    }
    return a;
};

// Simplified version
Lib.numberOfInteraction = function(exp) {

    if (exp === undefined) {

        return;

    }


    for (var i = exp.elements.events.length - 1; i >= 0; i--) {
        if (exp.elements.events[i].type === 'coin') {
            // lastCoin = exp.elements.events[i];
            break;
        }
    }

    return i;

};

Lib.durationBetweenCoins = function(exp) {

    var ret = [];
    var events = exp.elements.events;
    var lastTime = events[0].time;
    var ids = [];

    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.type === 'coin') {
            if (ids.indexOf(event.id) === -1) {
                ids.push(event.id);
                ret.push(Lib.timeDifference(lastTime, event.time));
                lastTime = event.time;
            }
        }
    }

    return ret;

};

Lib.toLaTeXMatrix = function(mat) {
    var str = 'x,y,r,g\n';
    var colSums = [];

    for (var i = 0; i < mat.length; i++) {

        colSums[i] = 0;

        for (var j = 0; j < mat[i].length; j++) {

            colSums[i] += mat[i][j];

        }

    }

    for (var i = 0; i < mat.length; i++) {

        for (var j = 0; j < mat[i].length; j++) {

            str += i + ',' + j + ',' + mat[i][j] + ',' + (mat[i][j] > colSums[i] / 3 ? '1' : '0' ) + ' \n';

        }

        // str += i === mat.length - 1 ? '' : '\n';
    }

    return str;
}