function main(path) {

    var db = JSON.parse(require('fs').readFileSync(path, 'utf8'));

    console.log(`There were ${db.users.length} users for ${db.experiments.length} experiments`);

    var meanTimeNoReco = 0;
    var meanTimeArrow = 0;
    var meanTimeViewport = 0;

    console.log();

    for (var i = 0; i < db.experiments.length; i++) {

        var exp = db.experiments[i];
        var events = exp.elements.events;

        if (events.length === 0 || exp.user.worker_id === null) {

            continue;

        }

        var coins = [];
        for (var j = 0; j < exp.elements.events.length; j++) {

            if (exp.elements.events[j].type === 'coin') {

                if (coins.find(function(elt) { return elt.id === exp.elements.events[j].id; }) === undefined) {

                    coins.push(exp.elements.events[j]);

                }

            }

        }
        console.log(`${exp.id} -> ${coins.length} (on ${exp.coinCombination.scene_id} )`);
    }

    console.log();

    for (var i = 0; i < db.users.length; i++) {

        var user = db.users[i];
        console.log(`${user.worker_id} has done ${user.experiments.length} experiments with rating ${user.rating}`);

    }

}

function timeDifference(time1, time2) {

    return new Date(time2).getTime() - new Date(time1).getTime();

}

function timeToString(_time) {

    var time = _time / 1000;

    return Math.floor(time / 3600) + 'h' + Math.floor((time % 3600) / 60) + 'm' + Math.floor(time % 60);

}

if (process.argv.length !== 3) {
    process.stderr.write('Error : please give me a JSON file to work on\n');
    process.exit(-1);
}

main(process.argv[2])
