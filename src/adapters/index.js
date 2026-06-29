/**
 * adapters/index.js
 *
 * Uniform export surface for all input adapters.
 * Each adapter returns { data, errors } — never performs discount math.
 */

export { parseRulesCSV } from './csv/rulesParser.js'
export { parseCartCSV } from './csv/cartParser.js'
