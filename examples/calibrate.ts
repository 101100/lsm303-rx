/*
 * examples/calibrate.ts
 * https://github.com/101100/lsm303-rx
 *
 * Example that can be used to determine the minimum and
 * maximum values for the magometer to calibrate it for
 * use as a compass.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

import * as i2cBus from "i2c-bus";
import printf from "printf";

import { Lsm303Driver, Vector } from "../";


const lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2cBus.openSync(1),
    magOffset: { x: 0, y: 0, z: 0 }
    // uncomment for debugging information
    // debug: true
});


let runningMin = { x: 32767, y: 32767, z: 32767 };
let runningMax = { x: -32768, y: -32768, z: -32768 };


console.log("Spin around the compass to calibrate (CTRL-C to stop)");
lsm303.streamMagnometer(100, true)
    .subscribe(
        function (next: Vector): void {
            runningMin.x = Math.min(runningMin.x, next.x);
            runningMin.y = Math.min(runningMin.y, next.y);
            runningMin.z = Math.min(runningMin.z, next.z);

            runningMax.x = Math.max(runningMax.x, next.x);
            runningMax.y = Math.max(runningMax.y, next.y);
            runningMax.z = Math.max(runningMax.z, next.z);

            console.log(printf(
                "Min: x: % 6d, y: % 6d, z: % 6d    Max: x: % 6d, y: % 6d, z: % 6d",
                runningMin.x, runningMin.y, runningMin.z,
                runningMax.x, runningMax.y, runningMax.z));
        },
        function (err: any): void {
            console.log("Error: " + err);
        },
        function (): void {
            console.log("Completed");
        }
    );
