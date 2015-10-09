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

    console.log(lib.toMatlabArray('X', lib.range(0,8)));

    var counter = 0;
    groups.forEach(function(elt) {
        elt.sort(lib.compareRecommendationStyle);
        elt.forEach(function(elt) {
            elt.durationBetweenCoins = lib.durationBetweenCoins(elt);

            console.log(lib.toMatlabArray('Y' + (++counter), lib.range(0,8, function(i) {
                var ret = elt.durationBetweenCoins[i];

                if (ret === undefined)
                    ret = 'Inf';

                return ret;
            })));
        });

    });

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2]);

