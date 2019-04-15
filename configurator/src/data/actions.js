import {uuid} from "../lib";
import {setState, getState} from "./index";

/**
 * @returns {string}
 */
export const addConfiguration = () => {
    const id = uuid();
    setState({configurations: {
        [id]: {}
    }});
    return id;
}

/**
 * @param configuration
 */
export const updateConfiguration = configuration => {
    setState({configurations: {
        [configuration.id]: configuration
    }});
}

/**
 * @param configuration
 */
export const removeConfiguration = configuration => {
    let configurations = getState().configurations;
    const {id} = configuration;
    if(!configurations[id]) return;
    delete configurations[id];
    setState({configurations});
}

/**
 * @param configuration
 * @returns {string}
 */
export const addRange = (configuration, range = false) => {
    const id = uuid();
    setState({
        configurations: {
            [configuration.id]: {
                ranges: {
                    [id]: {
                        name: 'Unnamed',
                        ...(range || {}),
                        id,
                    }
                }
            }
        }
    }, () => {
        setState({selectedConfiguration: getState().configurations[configuration.id]});
    });
}

/**
 * @param configuration
 * @param range
 */
export const updateRange = (configuration, range) => {
    setState({configurations: {
        [configuration.id]: {
            ranges: {
                [range.id]: range
            }
        },
    }}, () => {
        setState({selectedConfiguration: getState().configurations[configuration.id]});
    })
}

/**
 * @param configuration
 * @param range
 */
export const removeRange = (configuration, range) => {
    let configurations = getState().configurations;
    delete configurations[configuration.id].ranges[range.id];
    setState({configurations, selectedRange: false, selectedConfiguration: configurations[configuration.id]});
}