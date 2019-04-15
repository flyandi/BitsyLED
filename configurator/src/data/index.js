import {Defaults} from "../constants";
import {uuid, deepMerge} from "../lib";

/**
 * @type {boolean}
 */
export const USE_LOCAL_BUILD = !(window.chrome && window.chrome.serial);

/**
 * @type {{}}
 */
export const INITIAL = {
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
    if(!USE_LOCAL_BUILD &&  window.chrome) {
        window.chrome.storage.local.set({'@': window.__STATE});
    } else {
        localStorage.setItem('@', JSON.stringify(window.__STATE));
    }
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
        selectedConfiguration: false
    }} : deepMerge(window.__STATE, state);
}

/**
 * @param empty
 * @returns {*}
 */
export const hydrate = (empty = false) => {
    return new Promise(resolve => {
        try {
            empty ? resolve(hydrateState({}, true)) : (
                !USE_LOCAL_BUILD && window.chrome ?
                    window.chrome.storage.local.get(['@'], result => resolve(hydrateState(result['@'], true))) :
                    resolve(hydrateState(JSON.parse(localStorage['@']), true))
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
