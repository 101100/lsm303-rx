/*jslint node:true */

/*
 * examples/heading.js
 * https://github.com/101100/lsm303-rx
 *
 * Example that prints the current heading of the compass.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

var debug = require('debug');
var i2c = require('i2c-bus');

// uncomment for debugging information
//debug.enable('lsm303-rx');
var Lsm303Driver = require('../');


var lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2c.openSync(1),
    // set these based on the output from the
    // calibration program
    magMin: { x:-384, y:-803, z:-586 },
    magMax: { x:815, y:336, z:466 }
});


var headings = [
    'North',
    'Northeast',
    'East',
    'Southeast',
    'South',
    'Southwest',
    'West',
    'Northwest',
    'North'
];


console.log('Reading heading...');
lsm303.streamHeadings()
    .take(1)
    .subscribe(
        function (x) {
            // split it into 8 quadrants (North is 0)
            var headingNumber = Math.floor((x + 22.5) / 45);

            console.log('Heading: ' + headings[headingNumber]);
        },
        function (err) {
            console.log('Error: ' + err);
        }
    );
