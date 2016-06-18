/*jslint node:true */
/// <reference path = "../typings/tsd.d.ts" />

/*
 * examples/accelerometer.ts
 * https://github.com/101100/lsm303-rx
 *
 * Example to stream accelerometer values.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

import * as i2cBus from "i2c-bus";
import * as debug from "debug";
import printf from "printf";

import { Lsm303Driver, Vector } from "../index";

// uncomment for debugging information
//debug.enable('lsm303');

const lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2cBus.openSync(1)
});


console.log('Reading 50 accelerometer values...');
lsm303.streamAccelerometer()
    .take(50)
    .subscribe(
        function (next: Vector): void {
            console.log(printf('x: % 6.2f, y: % 6.2f, z: % 6.2f', next.x, next.y, next.z));
        },
        function (err: any): void {
            console.log('Error: ' + err);
        },
        function (): void {
            console.log('Completed');
        }
    );
