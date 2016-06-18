/*
 * src/constants.ts
 * https://github.com/101100/lsm303-rx
 *
 * Constants for LSM303DLHC I2C 3D compass and accelerometer module.
 *
 * Copyright (c) 2015 Jason Heard
 * Licensed under the MIT license.
 */

export default {
    MAG_ADDRESS: 0x1E, // 0011110
    ACC_ADDRESS: 0x19, // 0011001

    // accelerometer control registers
    CTRL_REG1_A: 0x20,
    CTRL_REG2_A: 0x21,
    CTRL_REG3_A: 0x22,
    CTRL_REG4_A: 0x23,
    CTRL_REG5_A: 0x24,
    CTRL_REG6_A: 0x25,
    STATUS_REG_A: 0x27,

    // magnometer control registers
    CRA_REG_M: 0x00,
    CRB_REG_M: 0x01,
    MR_REG_M: 0x02,

    ACC_OUT: {
        START: 0x28,
        X: {
            LOW: 0x28,
            HIGH: 0x29
        },
        Y: {
            LOW: 0x2A,
            HIGH: 0x2B
        },
        Z: {
            LOW: 0x2C,
            HIGH: 0x2D
        }
    },

    MAG_OUT: {
        START: 0x03,
        X: {
            LOW: 0x04,
            HIGH: 0x03
        },
        Y: {
            LOW: 0x08,
            HIGH: 0x07
        },
        Z: {
            LOW: 0x06,
            HIGH: 0x05
        }
    },

    MAG_TEMP_OUT: {
        HIGH: 0x31,
        LOW: 0x32
    },

    ACC_TO_GRAVITY: 0.001,

    MAG_TO_GAUSS: {
        X: 1100,
        Y: 1100,
        Z: 980
    }
};

