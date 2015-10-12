/*jslint node:true, bitwise:true */

/*
 * lsm303.js
 * https://github.com/101100/lsm303-rx
 *
 * Rx.js library for LSM303DLHC I2C 3D compass and accelerometer module
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

"use strict";

var debug = require('debug')('lsm303');
var rx = require('rx');

var constants = require('./constants.js');


// Enables the LSM303's accelerometer and magnetometer. Also:
// - Sets sensor full scales (gain) to default power-on values, which are
//   +/- 2 g for accelerometer and +/- 1.3 gauss for magnetometer
// - Selects 50 Hz ODR (output data rate) for accelerometer and 7.5 Hz
//   ODR for magnetometer. (These are the ODR settings for which the
//   electrical characteristics are specified in the datasheets.)
// - Enables high resolution modes (if available).
// Note that this function will also reset other settings controlled by
// the registers it writes to.
function initializeToDefaults(writeByte) {
    debug("Starting initialization");
    return rx.Observable.concat(
        // Accelerometer

        // 0x08 = 0b00001000
        // FS = 00 (+/- 2 g full scale); HR = 1 (high resolution enable)
        writeByte(constants.ACC_ADDRESS, constants.CTRL_REG4_A, 0x08),

        // 0x47 = 0b01000111
        // ODR = 0100 (50 Hz ODR); LPen = 0 (normal mode); Zen = Yen = Xen = 1 (all axes enabled)
        writeByte(constants.ACC_ADDRESS, constants.CTRL_REG1_A, 0x47),

        // Magnetometer

        // 0x10 = 0b00010000
        // DO = 100 (15 Hz ODR)
        writeByte(constants.MAG_ADDRESS, constants.CRA_REG_M, 0x10),

        // 0x20 = 0b00100000
        // GN = 001 (+/- 1.3 gauss full scale)
        writeByte(constants.MAG_ADDRESS, constants.CRB_REG_M, 0x20),

        // 0x00 = 0b00000000
        // MD = 00 (continuous-conversion mode)
        writeByte(constants.MAG_ADDRESS, constants.MR_REG_M, 0x00)
    ).doOnCompleted(function () { debug('Initialization complete'); });
}


function fromInt16(int16) {
    // if sign bit is set
    if (0x8000 & int16) {
        return int16 - 0x10000;
    } else {
        return int16;
    }
}


function bufferToVector(xLow, xHigh, yLow, yHigh, zLow, zHigh) {
    return function (buffer) {
        return {
            x: fromInt16((buffer[xHigh] << 8) | buffer[xLow]),
            y: fromInt16((buffer[yHigh] << 8) | buffer[yLow]),
            z: fromInt16((buffer[zHigh] << 8) | buffer[zLow])
        };
    };
}


var bufferToVectorAcc = bufferToVector(
    constants.ACC_OUT.X.LOW - constants.ACC_OUT.START,
    constants.ACC_OUT.X.HIGH - constants.ACC_OUT.START,
    constants.ACC_OUT.Y.LOW - constants.ACC_OUT.START,
    constants.ACC_OUT.Y.HIGH - constants.ACC_OUT.START,
    constants.ACC_OUT.Z.LOW - constants.ACC_OUT.START,
    constants.ACC_OUT.Z.HIGH - constants.ACC_OUT.START
);


var bufferToVectorMag = bufferToVector(
    constants.MAG_OUT.X.LOW - constants.MAG_OUT.START,
    constants.MAG_OUT.X.HIGH - constants.MAG_OUT.START,
    constants.MAG_OUT.Y.LOW - constants.MAG_OUT.START,
    constants.MAG_OUT.Y.HIGH - constants.MAG_OUT.START,
    constants.MAG_OUT.Z.LOW - constants.MAG_OUT.START,
    constants.MAG_OUT.Z.HIGH - constants.MAG_OUT.START
);


function readAccelerometer(readBytes) {
    return readBytes(constants.ACC_ADDRESS, constants.ACC_OUT.START | 0x80, 6)
        .map(bufferToVectorAcc)
        .doOnNext(function (x) {
            if (debug.enabled) {
                debug('Read accelerometer: ' + JSON.stringify(x));
            }
        });
}


function readMagnometer(readBytes) {
    return readBytes(constants.MAG_ADDRESS, constants.MAG_OUT.START, 6)
        .map(bufferToVectorMag)
        .doOnNext(function (x) {
            if (debug.enabled) {
                debug('Read magnometer: ' + JSON.stringify(x));
            }
        });
}


function averageVector(a, b) {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: (a.z + b.z) / 2
    };
}


function subtractVector(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
}


function crossProduct(a, b) {
    return {
        x: (a.y * b.z) - (a.z * b.y),
        y: (a.z * b.x) - (a.x * b.z),
        z: (a.x * b.y) - (a.y * b.x)
    };
}


function dotProduct(a, b) {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
}


function normalizeVector(a) {
    var mag = Math.sqrt(dotProduct(a, a));
    return {
        x: a.x / mag,
        y: a.y / mag,
        z: a.z / mag
    };
}


function createIntervalStream(interval) {
    return rx.Observable.just(-1)
        .concat(rx.Observable.interval(interval));
}


// Returns the angular difference in the horizontal plane between the
// "from" vector and north, in degrees.
// 
// Description of heading algorithm:
// Shift and scale the magnetic reading based on calibration data to find
// the North vector. Use the acceleration readings to determine the Up
// vector (gravity is measured as an upward acceleration). The cross
// product of North and Up vectors is East. The vectors East and North
// form a basis for the horizontal plane. The From vector is projected
// into the horizontal plane and the angle between the projected vector
// and horizontal north is returned.
function computeHeading(accVector, magVector) {
    var from = { x: 1, y: 0, z: 0 },
        east,
        north,
        heading;

    // compute east and north vectors
    east = normalizeVector(crossProduct(magVector, accVector));
    north = normalizeVector(crossProduct(accVector, east));

    // compute heading
    heading = Math.atan2(dotProduct(east, from), dotProduct(north, from)) * 180 / 3.14159265;
    if (heading < 0) {
        heading += 360;
    }
    debug('Heading computed: ' + heading);
    return heading;
}


function streamHeadings(readBytes, interval, magOffset) {
    return createIntervalStream(interval)
        .flatMap(function () {
            return rx.Observable.zip(readAccelerometer(readBytes), readMagnometer(readBytes), function (accVector, magVector) {
                return computeHeading(accVector, subtractVector(magVector, magOffset));
            });
        });
}


// Convert accelerometer raw data to proper units (gravities)
// Data is 16 bits, but only the high 12 are significant, so
// the raw data must be shifted right 4 bits before applying
// the conversion factor.
function accelerometerToGravity(a) {
    return {
        x: (a.x >> 4) * constants.ACC_TO_GRAVITY,
        y: (a.y >> 4) * constants.ACC_TO_GRAVITY,
        z: (a.z >> 4) * constants.ACC_TO_GRAVITY
    };
}


function streamAccelerometer(readBytes, interval) {
    return createIntervalStream(interval)
        .flatMap(function () {
            return readAccelerometer(readBytes);
        })
        .map(accelerometerToGravity);
}


// Convert raw magnometer data to proper units (gauss)
// For some reason, the axes have different conversion rates.
function magnometerToGauss(a) {
    return {
        x: a.x * constants.MAG_TO_GAUSS.X,
        y: a.y * constants.MAG_TO_GAUSS.Y,
        z: a.z * constants.MAG_TO_GAUSS.Z
    };
}


function streamMagnometer(readBytes, interval, rawData) {
    var magnometerStream = createIntervalStream(interval)
        .flatMap(function () {
            return readMagnometer(readBytes);
        });

    if (!rawData) {
        magnometerStream = magnometerStream
            .map(magnometerToGauss);
    }

    return magnometerStream;
}


function Lsm303Driver(options) {
    var i2cObject = options.i2c,
        writeByte = function (device, address, byte) {
            return rx.Observable.create(function (observer) {
                i2cObject.writeByte(device, address, byte, function (err) {
                    if (err) {
                        observer.onError(err);
                    } else {
                        observer.onCompleted();
                    }
                });
            });
        };

    if (options.magOffset) {
        this.magOffset = options.magOffset;
    } else if (options.magMin && options.magMax) {
        this.magOffset = averageVector(options.magMin, options.magMax);
    } else {
        this.magOffset = { x: 0, y: 0, z: 0 };
    }

    debug('Offset is: ' + JSON.stringify(this.magOffset));

    this.readBytes = function (device, address, length) {
        return rx.Observable.create(function (observer) {
            var buffer = new Buffer(length);
            i2cObject.readI2cBlock(device, address, length, buffer, function (err, bytesRead, buffer) {
                if (err) {
                    observer.onError(err);
                } else if (bytesRead !== length) {
                    observer.onError('Incorrect number of bytes read (expected: ' + length + ', recieved: ' + bytesRead + ')');
                } else {
                    observer.onNext(buffer);
                    observer.onCompleted();
                }
            });
        });
    };

    // the initialization stream is published so it begins immediately
    this.initializationStream = initializeToDefaults(writeByte).publish().refCount();
}


Lsm303Driver.prototype.streamHeadings = function createHeadingsStream(interval) {
    return rx.Observable.concat(
        this.initializationStream,
        streamHeadings(this.readBytes, interval || 100, this.magOffset)
    );
};


Lsm303Driver.prototype.streamAccelerometer = function createAcceleromterStream(interval) {
    return rx.Observable.concat(
        this.initializationStream,
        streamAccelerometer(this.readBytes, interval || 100)
    );
};


Lsm303Driver.prototype.streamMagnometer = function createMagnometerStream(interval, rawData) {
    return rx.Observable.concat(
        this.initializationStream,
        streamMagnometer(this.readBytes, interval || 100, rawData)
    );
};


module.exports = Lsm303Driver;

