/*jslint node:true */
/// <reference path = "../typings/tsd.d.ts" />

/*
 * examples/magnometer.ts
 * https://github.com/101100/lsm303-rx
 *
 * Example to stream magnometer values.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

import * as i2cBus from "i2c-bus";
import * as debug from "debug";
import printf from "printf";

import { Lsm303Driver, Vector } from "../";

// uncomment for debugging information
//debug.enable('lsm303-rx');

const lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2cBus.openSync(1)
});


console.log('Reading 50 magnometer values...');
lsm303.streamMagnometer()
    .take(50)
    .subscribe(
        function (next: Vector): void {
            console.log(printf('x: % 8f, y: % 8f, z: % 8f', next.x, next.y, next.z));
        },
        function (err: any): void {
            console.log('Error: ' + err);
        },
        function (): void {
            console.log('Completed');
        }
    );
