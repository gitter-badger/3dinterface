function main() {

    var db = JSON.parse(require('fs').readFileSync('./data.json', 'utf8'));

    console.log('There were ' + db.users.length + ' users for ' + db.experiments.length + ' experiments');

    var meanTimeNoReco = 0;
    var meanTimeArrow = 0;
    var meanTimeViewport = 0;

    for (var i = 0; i < db.experiments.length; i++) {

        var exp = db.experiments[i];
        var events = exp.elements.events;

        if (events.length === 0 || exp.user.worker_id === null) {

            continue;

        }

        console.log(exp.user.worker_id + ' : ' + exp.user.rating + ' -> ' + timeToString(timeDifference(events[0].time, events[events.length-1].time)));

    }

}

function timeDifference(time1, time2) {

    return new Date(time2).getTime() - new Date(time1).getTime();

}

function timeToString(_time) {

    var time = _time / 1000;

    return Math.floor(time / 3600) + 'h' + Math.floor((time % 3600) / 60) + 'm' + Math.floor(time % 60);

}

main();
