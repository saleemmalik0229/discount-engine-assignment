import { SCOPE } from '../domain/constants.js'

/**
 * Normalises a string for case-insensitive comparison.
 * @param {string} s
 * @returns {string}
 */
function normalise(s) {
  return s.trim().toLowerCase()
}

/**
 * Returns true if an item-level rule applies to this cart item.
 * Cart-scope rules never match individual items.
 * @param {import('../domain/types.js').CartItem} item
 * @param {import('../domain/types.js').DiscountRule} rule
 * @returns {boolean}
 */
export function ruleMatchesItem(item, rule) {
  if (rule.scope === SCOPE.BRAND) {
    return normalise(item.brand) === normalise(rule.appliesTo ?? '')
  }
  if (rule.scope === SCOPE.PLATFORM) {
    return normalise(item.platform) === normalise(rule.appliesTo ?? '')
  }
  return false
}

/**
 * Returns all item-level rules that match the given cart item.
 * @param {import('../domain/types.js').CartItem} item
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').DiscountRule[]}
 */
export function getMatchingRules(item, rules) {
  return rules.filter((rule) => ruleMatchesItem(item, rule))
}

/**
 * Returns all cart-scope rules from the rule set.
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').DiscountRule[]}
 */
export function getCartRules(rules) {
  return rules.filter((rule) => rule.scope === SCOPE.CART)
}

/**
 * Returns all item-level rules (brand + platform) from the rule set.
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').DiscountRule[]}
 */
export function getItemLevelRules(rules) {
  return rules.filter((rule) => rule.scope === SCOPE.BRAND || rule.scope === SCOPE.PLATFORM)
}
