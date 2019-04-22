/**
 * @param o
 * @returns {{_id: string}[]}
 * @constructor
 */
export const ObjectArray = o => Object.keys(o).map(id => ({...o[id], id}));

/**
 * @returns {string}
 */
export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

/**
 * @param sources
 */
export const deepMerge = (...sources) => {
    let acc = {}
    for (const source of sources) {
        if (source instanceof Array) {
            if (!(acc instanceof Array)) {
                acc = []
            }
            acc = [...acc, ...source]
        } else if (source instanceof Object) {
            for (let [key, value] of Object.entries(source)) {
                if (value instanceof Object && key in acc) {
                    value = deepMerge(acc[key], value)
                }
                acc = { ...acc, [key]: value }
            }
        }
    }
    return acc
}