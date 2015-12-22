## Rx.js library for LSM303DLHC I2C 3D compass and accelerometer module

[![NPM version](https://badge.fury.io/js/lsm303-rx.svg)](http://badge.fury.io/js/lsm303-rx)

This is an npm module that creates [Rx.JS](https://github.com/Reactive-Extensions/RxJS)
streams of readings from the LSM303 I2C 3D compass and accelerometer module.
Information on the LSM303DLHC can be found
[here](http://www.st.com/web/catalog/sense_power/FM89/SC1449/PF251940)
and it is available for purchase at
[Adafruit](http://www.adafruit.com/products/1120).


## Usage

```js
var i2c = require("i2c-bus");
var Lsm303Driver = require("lsm303-rx");

var options = {
    // looking at the source code, the synchronous and
    // asynchronous open functions are identical
    i2c: i2c.openSync(1)
};

lsm303 = new Lsm303Driver(options);

console.log('Reading 10 headings...');
lsm303.streamHeadings(500) // sample every 500 ms
    .take(10)
    .subscribe(
        function (heading) {
            console.log('Next: ' + heading);
        },
        function (err) {
            console.log('Error: ' + err);
        },
        function () {
            console.log('Completed');
        }
    );
```

Note that you need to open the [`i2c-bus`](https://npmjs.org/package/i2c-bus)
and pass it in to the module.


## Options

- `i2c` (required): The object used to communicate to the PWM/servo driver.
- `magOffset`: Offset to be applied to the magnometer readings.
- `magMin`: Expected minimum values for the compass module.  This
  is used with `magMax` to calculate an offset (by averaging the
  values).  This will be ignored if `magOffset` is given.
- `magMax`: Expected maximum values for the compass module.  This
  is used with `magMin` to calculate an offset (by averaging the
  values).  This will be ignored if `magOffset` is given.
- `debug`: If truthy, debugging to the console will be enabled.


## Available streams

- `streamHeadings(interval, forwardVector)`: Produces a stream of headings in
  degrees from North.  This uses the compass and accelerometer to allow it to
  compensate for tilting.
  - `interval`: (*optional*) the polling interval in milliseconds for the
    sensor stream.  The default value is 100 ms.
  - `forwardVector` (*optional*) the normalized vector that represents "forward" on the
    module.  The default is the value for the Adafruit breakout board, which is
    `{ x: 1, y: 0, z: 0 }`.
- `streamAccelerometer(interval)`: Produces a stream of 3D accelerometer data.
  - `interval`: (*optional*) the polling interval in milliseconds for the
    sensor stream.  The default value is 100 ms.
- `streamMagnometer(interval, rawData)`: Produces a stream of 3D magnometer data.
  - `interval`: (*optional*) the polling interval in milliseconds for the
    sensor stream.  The default value is 100 ms.
  - `rawData`: (*optional*) if truthy, then the raw magnometer data is returned
    instead of the values in Gauss.  The default value is `false`.


## Debugging

This project uses the [`debug`](https://npmjs.org/package/debug) library for
debugging.  This allows you to enable debugging using environment variables or in
code before constructing the Lsm303Driver object.  See the debug library
documentation for more information.


## Acknowledgements

This module was based on
[Pololu's Arduino library for the LSM303 module](https://github.com/pololu/lsm303-arduino)
with some ideas borrowed from
[the `lsm303` NPM module](https://www.npmjs.com/package/lsm303).

