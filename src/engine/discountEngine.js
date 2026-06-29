/**
 * discountEngine.js
 *
 * Public API for the pure discount calculation engine.
 * No UI dependencies, no adapter imports — only typed domain objects.
 */

export { ruleMatchesItem, getMatchingRules, getCartRules, getItemLevelRules } from './ruleMatcher.js'
export { calculateDiscountAmount, applyItemDiscounts, ruleToReasoning } from './discountCalculator.js'
export { processCartItems, itemSubtotal, applyCartDiscount, buildCartSummary } from './cartProcessor.js'

/**
 * Primary entry point: processes a full cart with all discount rules.
 * @param {import('../domain/types.js').CartItem[]} cartItems
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').CartSummary}
 */
export { buildCartSummary as processFullCart } from './cartProcessor.js'

/**
 * @deprecated Use processFullCart for full cart processing including cart-level offers.
 * Runs item-level discounts only across every item in the cart.
 * @param {import('../domain/types.js').CartItem[]} cartItems
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').ItemDiscountResult[]}
 */
export { processCartItems as processCart } from './cartProcessor.js'

/**
 * @deprecated Use CartSummary.finalTotal from processFullCart instead.
 * @param {import('../domain/types.js').ItemDiscountResult[]} results
 * @returns {number}
 */
export { itemSubtotal as cartTotal } from './cartProcessor.js'
