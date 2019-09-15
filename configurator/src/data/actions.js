import {uuid} from "../lib";
import {setState, getState} from "./index";
import {Defaults} from "../constants";

/**
 * @returns {string}
 */
export const addConfiguration = preset => {
    const id = uuid();
    setState({configurations: {
        [id]: {...(preset || {}), id}
    }});
    return id;
}

/**
 * @returns {string}
 */
export const getConfiguration = id => {
    return getState().configurations[id] || {};
}

/**
 * @param configuration
 */
export const updateConfiguration = configuration => {
    if(!configuration.id) return false;
    setState({configurations: {
        [configuration.id]: {...configuration}
    }});
    return true;
}

/**
 * @param configuration
 */
export const removeConfiguration = configurationId => {
    let configurations = getState().configurations;
    if(!configurations[configurationId]) return;
    delete configurations[configurationId];
    setState({configurations});
}

/**
 * @param configurationId
 * @returns {string}
 */
export const addRange = (configurationId, range = false) => {
    const id = uuid();
    setState({
        configurations: {
            [configurationId]: {
                ranges: {
                    [id]: {
                        name: 'Unnamed',
                        ...(range || {}),
                        id,
                    }
                }
            }
        }
    });
    return id;
}

/**
 * @param configuration
 * @param range
 */
export const updateRange = (configurationId, range) => {
    setState({configurations: {
        [configurationId]: {
            ranges: {
                [range.id]: range
            }
        },
    }}, () => {
        setState({selectedConfiguration: configurationId});
    })
}

/**
 * @param id
 * @param range
 */
export const removeRange = (configurationId, range) => {
    let configurations = getState().configurations;
    delete configurations[configurationId].ranges[range.id];
    setState({configurations, selectedRange: false});
}

/**
 * @param configurationId
 * @param rangeId
 * @param led
 */
export const updateLed  = (configurationId, rangeId, led) => {
    setState({
        configurations: {
            [configurationId]: {
                ranges: {
                    [rangeId]: {
                        leds: {
                            [led.id]: led
                        }
                    }
                }
            }
        }
    });
}