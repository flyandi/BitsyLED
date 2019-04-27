/**
 * @imports
 */
import {deepOrange, blue, green} from '@material-ui/core/colors';
import ShapeMulticopter from '../resources/shape-multicopter.svg';
import ShapeAirplane from '../resources/shape-plane.svg';
import ShapeWing from '../resources/shape-wing.svg';
import ShapeParamotor from '../resources/shape-paramotor.svg';
import ShapeCar from '../resources/shape-car.svg';

/**
 * @native-imports
 */
const App = window.require("electron").remote.app;

/**
 * @type {string}
 */
export const VERSION = App.getVersion();

/**
 * @type {{}}
 * @todo move this into the board section, right now ok for POC
 */
export const Strands = {
    l: {
        pin: 1,
        name: 'Left Strand',
        short: 'L',
        color: deepOrange[300],
        selectedColor: deepOrange[800],
    },
    r: {
        pin: 2,
        name: 'Right Strand',
        short: 'R',
        color: green[300],
        selectedColor: green[800],
    },
    o: {
        pin: 3,
        name: 'Other Strand',
        short: 'O',
        color: blue[300],
        selectedColor: blue[800],
    },
}

/**
 * @type {{}}
 */
export const Patterns = {
    off: {
        name: 'Off',
        fn: 0,
    },
    solid: {
        name: 'Solid',
        fn: 1,
    },
    blink: {
        name: 'Blink',
        fn: 2,
        freq: true,
    },
    strobe: {
        name: 'Strobe',
        fn: 3,
        freq: true,
    },
    pulse: {
        name: 'Pulse',
        fn: 4,
        freq: true,
    }
};

/**
 * @type {{}}
 */
export const Speeds = {
    fastest: {
        name: 'Fastest (50ms)',
        ms: 50,
        fn: 0,
    },
    faster: {
        name: 'Faster (150ms)',
        ms: 150,
        fn: 1,
    },
    fast: {
        name: 'Fast (250ms)',
        ms: 250,
        fn: 2,
    },
    normal: {
        name: 'Normal (500ms)',
        ms: 500,
        fn: 3,
    },
    slow: {
        name: 'Slow (750ms)',
        ms: 750,
        fn: 4,
    },
    moreslow: {
        name: 'Slower (1000ms)',
        ms: 1000,
        fn: 5,
    },
    slowest: {
        name: 'Slowest (1500ms)',
        ms: 1500,
        fn: 6,
    },
}

/**
 * @type {{}}
 */
export const Times = {
    1: {
        label: '1 second',
        value: 1,
    },
    2: {
        label: '2 seconds',
        value: 2,
    },
    3: {
        label: '3 seconds',
        value: 3,
    },
    5: {
        label: '5 seconds',
        value: 5,
    },
    10: {
        label: '10 seconds',
        value: 10,
    },
    15: {
        label: '15 seconds',
        value: 15,
    },
    30: {
        label: '30 seconds',
        value: 30,
    },
    45: {
        label: '45 seconds',
        value: 15,
    },
    60: {
        label: '1 minute',
        value: 60,
    },
    120: {
        label: '2 minutes',
        value: 120,
    },
    300: {
        label: '5 minutes',
        value: 300,
    },
}


/**
 * Presets
 * @type {*[]}
 */
export const Presets = [
    {
        value: 'nav',
        label: 'Navigation',
    },
    {
        value: 'navmin',
        label: 'Minimal Navigation',
    },
    {
        value: 'navstrobe',
        label: 'Navigation with Strobe',
    },
    {
        value: 'landing',
        label: 'Landing',
    },
    {
        value: 'car',
        label: 'Car/Truck',
    },
];

/**
 * Layouts
 * @type {*[]}
 */
export const Layouts = {
    airplane: {
        value: 'airplane',
        label: 'Airplane',
        shape: ShapeAirplane,
        shapeStyles: {
            width: 695,
        }
    },
    wing: {
        value: 'wing',
        label: 'Flying Wing',
        shape: ShapeWing,
        shapeStyles: {
            width: 695,
        }
    },
    multicopter: {
        value: 'multicopter',
        label: 'Multicopter',
        shape: ShapeMulticopter,
        shapeStyles: {
            height: 695,
        }
    },
    helicopter: {
        value: 'helicopter',
        label: 'Helicopter',
    },
    paramotor: {
        value: 'paramotor',
        label: 'Paramotor',
        shape: ShapeParamotor,
        shapeStyles: {
            width: 695,
        }
    },
    car: {
        value: 'car',
        label: 'Car/Truck',
        shape: ShapeCar,
        shapeStyles: {
            height: 695,
        }
    },
    custom: {
        value: 'custom',
        label: 'Custom',
    },
}

/**
 * @type {{}}
 */
export const Resolutions = {
    20: {
        value: 20,
        label: 'Highest'
    },
    50: {
        value: 50,
        label: 'High',
    },
    100: {
        value: 100,
        label: 'Normal'
    },
    150: {
        value: 150,
        label: 'Low'
    },
    200: {
        value: 200,
        label: 'Lowest'
    }
}

/**
 * @type {{}}
 */
export const Inputs = {
    rc: {
        fn: 0,
        value: 'rc',
        label: 'RC (PWM)',
        range: {
            min: 900,
            max: 2100,
            marks: [1200, 1500, 1700],
        }

    },
    al: {
        fn: 1,
        value: 'al',
        label: 'Analog (Potentiometer)',
        range: {
            min: 0,
            max: 1000,
            marks: [100, 250, 500, 750],
        }
    },
    tb: {
        fn: 2,
        value: 'tb',
        label: 'Time Based',
        range: false,
        timed: true,
    },
    aw: {
        fn: 3,
        value: 'aw',
        label: 'Always',
        range: false,
        always: true,
        min: 500,
        max: 500
    },
}

/**
 * @type {{}}
 */
export const Events = {
    Remove: 'remove',
    Rename: 'rename',
    Duplicate: 'duplicate',
    Select: 'select',
}


/**
 * Bauds
 * @type {*[]}
 */
export const Bauds = {
    9600: {
        value: 9600,
        label: '9600',
    },
    38400: {
        value: 38400,
        label: '38400',
    },
    57600: {
        value: 57600,
        label: '57600',
    },
    115200: {
        value: 115200,
        label: '115200',
    }
}


/**
 * Boards
 * @type {*[]}
 */
export const Boards = {
    bl: {
        fn: 2,
        value: 'bl',
        label: 'BitsyLED',
        leds: 10,
        ranges: 5
    },
    arduino: {
        fn: 4,
        value: 'arduino',
        label: 'Arduino',
        leds: 25,
        ranges: 6
    },
}

/**
 * Defaults
 * @type {{}}
 */
export const Defaults = {
    Layout: 'custom',
    Strand: 'l',
    Pattern: 'solid',
    Speed: 'normal',
    LedColor: '#000000',
    Input: 'rc',
    Resolution: 100,
    Leds: 10,
    Baud: 9600,
    Board: 'bl'
}
