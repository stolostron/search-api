'use strict';

var PeriodicTask = require('./periodic-task');

var delay = +process.env['DELAY'] || 1000;
var maxDelta = +process.env['MAX_DELTA'] || 10;

function t() { return +new Date(); }

function computeDeviation(deviation) {
    deviation.iteration += 1;
    deviation.ti = t() - deviation.t0;
    deviation.delta = deviation.ti - (deviation.iteration * delay);
}

function deviantionIterationLimit(deviation) {
    // We stop as soon as the deviation exceeds the maximum allowed:
    if (deviation.delta > maxDelta) {
        console.log(
            'time=' + deviation.ti + ' ' +
            'iterations=' + deviation.iteration + ' ' +
            'delta=' + deviation.delta
        );
        return true;
    }
}

var task = new PeriodicTask(computeDeviation, {
    delay: delay,
    stopCondition: deviantionIterationLimit
});

task.run({ t0: t(), iteration: -1 });
