import {Defaults} from "../constants";
import {uuid, deepMerge} from "../lib";

/**
 * @native-imports
 */
const Storage = window.require("electron").remote.require("electron-json-storage");

/**
 * @type {string}
 */
const KEY = "ITEM";

/**
 * @type {string}
 */
const STORAGE = 'bitsyled.settings.json';


/**
 * @type {{}}
 */
export const INITIAL = {
    darkMode: false,
    serialMonitor: false,
    openConfiguration: false,
    mainMenu: true,
    selectedConfiguration: false,
    selectedStrand: Defaults.Strand,
    selectedRange: false,
    enableGrid: true,
    enableLayout: true,
    enableEditStrand: false,
    selectedLed: false,
    selectedLedTarget: false,
    simulate: false,
    editRange: false,
    configurations: {},
    serialPorts: [],
    selectedSerialPort: false,
    serialPayload: false,
    serialBoardStatus: false,
    serialChannelValue: false,
    /*
        [uuid()]: {
            name: 'Quadcopter XL',
            layout: Defaults.Layout,
            input: Defaults.Input,
            resolution: Defaults.Resolution,
            leds: Defaults.Leds,
            ranges: {
                [uuid()]: {
                    min: 1000,
                    max: 1200,
                    name: 'Navigation',
                    leds: {}
                },
                [uuid()]: {
                    min: 1800,
                    max: 1900,
                    name: 'Strobe',
                    leds: {}
                }
            }
        }
    },*/
}

/**
 * @state
 */
window.__STATE = INITIAL;

/**
 * @type {{}}
 * @private
 */
window.__SUBSCRIBERS = {};

/**
 * @param name
 * @param data
 */
const persist = () => {
    console.log("SAVE", window.__STATE);
    Storage.set(STORAGE, window.__STATE, err => {if(err) throw(err)});
}

/**
 * @param state
 * @param strategy
 */
export const hydrateState = (state, strategy = false) => {
    window.__STATE = strategy ? {...window.__STATE, ...state, ...{
        serialPayload: false,
        serialBoardStatus: false,
        serialChannelValue: false,
        selectedRange: false,
        editRange: false,
        selectedConfiguration: false,
        serialPorts: [],
    }} : deepMerge(window.__STATE, state);
}

/**
 * @param empty
 * @returns {*}
 */
export const hydrate = (empty = false) => {

    console.log(Storage.getDataPath());

    return new Promise(resolve => {
        try {
            empty ? resolve(hydrateState({}, true)) : (
                Storage.get(STORAGE, (err, data) => {
                    if(err) return resolve({});
                    console.log("LOAD", data);
                    return resolve(hydrateState(data, true))
                })
            )
        } catch (e) {
            resolve({});
        }
    })
}


/**
 * @param state
 * @param done
 */
export const setState = (state, done = false) => {
    hydrateState(state);
    trigger(state);
    persist();
    done && done();
}

/**
 * @returns {{menu: boolean}|*}
 */
export const getState = () => window.__STATE;

/**
 * @param name
 * @param callback
 */
export const subscribe = (name, callback) => {
    window.__SUBSCRIBERS = {
        ...window.__SUBSCRIBERS,
        [name]: [
            ...(window.__SUBSCRIBERS[name] || []),
            callback
        ]
    }

    callback && callback(window.__STATE[name]);
}

/**
 * @param name
 * @param value
 */
export const trigger = state =>
    Object.keys(state).forEach(name =>
        (window.__SUBSCRIBERS[name] || []).forEach(cb => cb && cb(state[name])));
