/**
 * @imports
 */
import {setState, getState} from "./index";
import {ObjectArray} from "../lib";
import { decomposeColor }  from '@material-ui/core/styles/colorManipulator';
import {Strands, Patterns, Speeds, Boards, Defaults, Inputs} from "../constants";

/**
 * @type {number}
 */
const SERIAL_BUFFER = 25;


/**
 * @param a
 * @returns {number}
 */
export const byteInt = a => (a[1]<<8) | a[0];

/**
 * @param b
 * @returns {*[]}
 */
export const intByte = b => [(b & 0xFF), (b >> 8) & 0xFF];

/**
 * @param n
 * @param b
 */
export const nToBin = (n, b = 3) => (n & 0xFF).toString(2).padStart(b, '0');

/**
 * @param x
 * @param in_min
 * @param in_max
 * @param out_min
 * @param out_max
 * @returns {*}
 */
export const mapa = (x, in_min, in_max, out_min, out_max) => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

/**
 * @param a
 * @param in_min
 * @param in_max
 * @param out_min
 * @param out_max
 * @returns {*}
 */
export const amap = (a, in_min, in_max, out_min, out_max) => a.map(v => mapa(v, in_min, in_max, out_min, out_max));


/**
 * @type {string[]}
 */
export const serialErrors = ["break", "frame_error", "overrun", "buffer_overflow", "parity_error", "system_error"];

/**
 * @type {string[]}
 */
export const serialErrorsNormal = ["DISCONNECTED", "timeout", "device_lost"];

/**
 * @type {{}}
 */
export const SerialStatus = {
    DISCONNECTED: 'Not connected',
    CONNECTING: 'Connecting',
    CONNECTED: 'Connected',
    SYNCING: 'Syncing',
    DONE: 'Done'
}

/**
 * @type {{}}
 */
export const SerialCommand = {
    STATUS: {
        cmd: 0x01,
        expected: 12,
        invoke: buffer => {
            setState({
                // header defined in firmware
                serialBoardStatus: {
                    board: buffer[0],
                    version: byteInt([buffer[1], buffer[2]]),
                    memory: byteInt([buffer[3], buffer[4]]),
                    supportedNumRanges: buffer[5],
                    supportedNumStrands: buffer[6],
                    supportedNumLeds: buffer[7],
                    reservedA: buffer[8],
                    reservedB: buffer[9],
                    reservedC: buffer[10],
                    reservedD: buffer[11],
                }
            });
        }
    },
    UPDATE: {
        cmd: 0xFF,
        expected: 0,
    },
    CHANNEL: {
        cmd: 0x03,
        expected: 2,
        invoke: buffer => {
            //const selectedConfiguration = getState().selectedConfiguration;
            const resolution = 20; //(selectedConfiguration.resolution || Defaults.Resolution);
            const serialChannelValue = Math.floor(byteInt(buffer) / resolution) * resolution;
            setState({serialChannelValue});
        }
    },
    MARKER: {
        cmd: 0x04,
        expected: 0,
        invoke: (buffer, parent) => {
            // next
            parent.transferSerialChunk();
        }
    },
    DONE: {
        cmd: 0x05,
        expected: 2,
        invoke: (buffer, parent) => {
            // next
            const written = byteInt(buffer);
            parent.completeSerialTransfer();
        }
    }
}


/**
 * @returns {Promise<any>}
 */
export const updateSerialDevices = () => {
    const {chrome} = window;
    const {serial} = chrome;
    return new Promise((resolve) =>
        serial && serial.getDevices(ports => {
            setState({serialPorts: ports}, () => resolve());
        }) || resolve()
    );
}


/**
 * @param mirror
 * @param pattern
 * @param speed
 */
export const encodeLedParams = (rgb, mirror, pattern, speed) => {
    // rgb, pattern, speed, mirror
    const u = [[...amap(rgb, 0, 255, 0, 7), Patterns[pattern].fn, Speeds[speed].fn].map(n => nToBin(n)).join(''), mirror ? '1' : '0'].join('');
    const w = parseInt(u, 2);
    return intByte(w);
}


/**
 * @param data
 * @returns {Array}
 */
export const getSerialPayload = data => {

    if(!data) return;

/*
Protocol:
..command
byte    command: update
..header
byte    <count(leds)>       rem: led my be dictated by firmware
byte    <count(ranges)>     rem: ranges may be dictated by firmware
byte    <count(strands)>    rem: strands may be dictated by firmware
byte    mode
.. ranges
byte     <min>
byte     <max>
..strands
byte    <pin>
..leds
struct  <led[0..n]>
led =   <r, g, b, mirror, pattern, speed>

 */

    const {leds, ranges} = Boards[data.board] || Boards[Defaults.Board];
    const {input} = data;

    let r = ObjectArray(data.ranges || {});

    if(r.length > ranges) {
        r = r.splice(ranges);
    } else if (r.length < ranges) {
        let m = (ranges-r.length);
        for (var x = 0; x < m;x++) {
            r.push({});
        }
    }

    // ..header
    let result = [SerialCommand.UPDATE.cmd, leds, r.length, ObjectArray(Strands).length, Inputs[input || Defaults.input].fn];

    // ..ranges
    r.forEach(range => result = [...result, Math.floor(range.min/10) || 0, Math.ceil(range.max/10) || 0]);

    // ..strands
    ObjectArray(Strands).forEach(strand => result = [...result, strand.pin]);

    // ..leds
    r.forEach(range => {

        ObjectArray(Strands).forEach(strand => {

            let rleds = [];
            ObjectArray(range.leds || {}).forEach(led => {
                if (led.strand == strand.id && led.color) {
                    let color = decomposeColor(led.color);
                    if (color && color.type == "rgb") {
                        rleds[led.index] = encodeLedParams(color.values, led.mirror, led.pattern, led.speed);
                    }
                }
            });

            for(var i = 0; i < leds; i++) {
                let k = rleds[i] || [0, 0]; // two bytes - nothing
                result = [...result, ...k];
            }
        });
    });

    return result;
}

export const convertToChunks = payload => {
    // chunk it
    let chunks = [];
    for (let i=0, j=payload.length; i<j; i+=SERIAL_BUFFER) {
        chunks.push(payload.slice(i, i + SERIAL_BUFFER));
    }
    return chunks;
}