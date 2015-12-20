/*jslint node:true */

/*
 * examples/magnometer.js
 * https://github.com/101100/lsm303-rx
 *
 * Example to stream magnometer values.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

var debug = require('debug');
var i2c = require('i2c-bus');
var printf = require('printf');

// uncomment for debugging information
//debug.enable('lsm303-rx');
var Lsm303Driver = require('../');


var lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2c.openSync(1)
});


console.log('Reading 50 magnometer values...');
lsm303.streamMagnometer()
    .take(50)
    .subscribe(
        function (next) {
            console.log(printf('x: % 8f, y: % 8f, z: % 8f', next.x, next.y, next.z));
        },
        function (err) {
            console.log('Error: ' + err);
        },
        function () {
            console.log('Completed');
        }
    );