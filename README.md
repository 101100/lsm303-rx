## Rx.js library for LSM303DLHC I2C 3D compass and accelerometer module

[![NPM version](https://badge.fury.io/js/lsm303-rx.svg)](http://badge.fury.io/js/lsm303-rx)

This is an npm module that creates [Rx.JS](https://github.com/Reactive-Extensions/RxJS)
streams of readings from the LSM303 I2C 3D compass and accelerometer module.
Information on the LSM303DLHC can be found
[here](http://www.st.com/web/catalog/sense_power/FM89/SC1449/PF251940)
and it is available for purcahse at
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


## Available streams

- `streamHeadings(interval)`: Produces a stream of headings in degrees from North.
  This uses the compass and magnometer to allow it to compensate for tilting.
  This also assumes that the heading is defined by the positive Y axis.
- `streamAccelerometer(interval)`: Produces a stream of 3D accelerometer data.
- `streamMagnometer(interval, rawData)`: Produces a stream of 3D magnometer data.
  The raw values from the sensor are returned if `rawData` is truthy.

For each of these functions, `interval` can be optionally given to determine
polling interval for the sensor stream.  The interval is in milliseconds and
defaults to 100 ms.

## Acknowledgements

This module was based on
[Pololu's Arduino library for the LSM303 module](https://github.com/pololu/lsm303-arduino)
with some ideas borrowed from
[the `lsm303` NPM module](https://www.npmjs.com/package/lsm303).

