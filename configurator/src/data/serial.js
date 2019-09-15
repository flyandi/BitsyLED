/**
 * @imports
 */
import {setState, getState} from "./index";
import {ObjectArray} from "../lib";
import { decomposeColor }  from '@material-ui/core/styles/colorManipulator';
import {Strands, Patterns, Speeds, Boards, Defaults, Inputs} from "../constants";

/**
 * @native-imports
 */
const SerialPort = window.require( "electron" ).remote.require( "serialport" );

/**
 * @type {number}
 */
const SERIAL_BUFFER = 16; // smaller chunks

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
export const mapa = (x, in_min, in_max,  out_min, out_max) => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;

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
    DONE: 'Done',
    FAILED: 'Failed',
}

/**
 * @type {{}}
 */
export const SerialCommand = {
    STATUS: {
        cmd: 0,
        expected: 11,
        invoke: buffer => {
            setState({
                // header defined in firmware
                serialBoardStatus: {
                    board: buffer[0],
                    version: byteInt([buffer[1], buffer[2]]),
                    reservedD: byteInt([buffer[3], buffer[4]]), // was free memory but no longer supported
                    supportedNumRanges: buffer[5],
                    supportedNumStrands: buffer[6],
                    supportedNumLeds: buffer[7],
                    reservedA: buffer[8],
                    reservedB: buffer[9],
                    reservedC: buffer[10],
                }
            });
        }
    },
    UPDATE: {
        cmd: 1,
        expected: 0,
    },
    CHANNEL: {
        cmd: 2,
        expected: 2,
        invoke: buffer => {
            //const selectedConfiguration = getState().selectedConfiguration;
            const resolution = 20; //(selectedConfiguration.resolution || Defaults.Resolution);
            const serialChannelValue = Math.floor(byteInt(buffer) / resolution) * resolution;
            setState({serialChannelValue});
        }
    },

    MARKER: {
        cmd: 3,
        expected: 0,
        invoke: (buffer, parent) => {
            // next
            parent.transferSerialChunk();
        }
    },
    DONE: {
        cmd: 4,
        expected: 3,
        invoke: (buffer, parent) => {
            // next
            const written = byteInt(buffer);
            parent.completeSerialTransfer(written,  buffer[2]);
        }
    }
}


/**
 * @returns {Promise<any>}
 */
export const updateSerialDevices = () => {

    return SerialPort.list().then(ports => {
        setState({serialPorts: ports.map(p => p.comName)});
    }).catch(e => {
        // do nothing
    });
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
..ranges
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
    const mode = Inputs[input || Defaults.Input];

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

    let result = [SerialCommand.UPDATE.cmd, leds, r.length, ObjectArray(Strands).length, mode.fn];

    // ..ranges
    r.forEach(range => {
        const {min, max} = {min: 0, max: 0, ...mode, ...range};

        if(mode.timed) {
            result = [...result, ...intByte(min)]; // timed uses the min as seconds as int16
        } else {
            result = [...result, Math.floor(min / 10) || 0, Math.ceil(max / 10) || 0];
        }
    });

    // ..strands
    // @todo bring this to life and reflect in firmware
    //   -> I will leave it in here for future upgrades - but for now I decided to go static mapping.
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

/**
 * @param payload
 * @returns {Array}
 */
export const convertToChunks = payload => {
    // chunk it
    let chunks = [];
    for (let i=0, j=payload.length; i<j; i+=SERIAL_BUFFER) {
        chunks.push(payload.slice(i, i + SERIAL_BUFFER));
    }
    return chunks;
}