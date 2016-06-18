/*
 * examples/heading.ts
 * https://github.com/101100/lsm303-rx
 *
 * Example that prints the current heading of the compass.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

import * as i2cBus from "i2c-bus";

import { Lsm303Driver } from "../";


const lsm303 = new Lsm303Driver({
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2cBus.openSync(1),
    // set these based on the output from the
    // calibration program
    magMin: { x: -384, y: -803, z: -586 },
    magMax: { x: 815, y: 336, z: 466 }
    // uncomment for debugging information
    // debug: true
});


const headings: string[] = [
    "North",
    "Northeast",
    "East",
    "Southeast",
    "South",
    "Southwest",
    "West",
    "Northwest",
    "North"
];


console.log("Reading heading...");
lsm303.streamHeadings()
    .take(1)
    .subscribe(
        function (heading: number): void {
            // split it into 8 quadrants (North is 0)
            const headingNumber = Math.floor((heading + 22.5) / 45);

            console.log("Heading: " + headings[headingNumber]);
        },
        function (err): void {
            console.log("Error: " + err);
        }
    );
