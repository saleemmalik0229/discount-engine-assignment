import { TYPE } from '../domain/constants.js'
import { formatINR, roundRupee } from '../utils/currency.js'
import { applyItemDiscounts, calculateDiscountAmount } from './discountCalculator.js'
import { getCartRules, getItemLevelRules } from './ruleMatcher.js'

/**
 * Processes all cart items with item-level discount rules.
 * @param {import('../domain/types.js').CartItem[]} cartItems
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').ItemDiscountResult[]}
 */
export function processCartItems(cartItems, rules) {
  const itemRules = getItemLevelRules(rules)
  return cartItems.map((item) => applyItemDiscounts(item, itemRules))
}

/**
 * Sums the final prices across all item results.
 * @param {import('../domain/types.js').ItemDiscountResult[]} results
 * @returns {number}
 */
export function itemSubtotal(results) {
  return results.reduce((sum, r) => sum + r.finalPrice, 0)
}

/**
 * Builds the customer-facing reasoning string for a cart-level offer.
 * @param {import('../domain/types.js').DiscountRule} rule
 * @param {number} discountAmount
 * @returns {string}
 */
function cartOfferReasoning(rule, discountAmount) {
  if (rule.type === TYPE.PERCENTAGE) {
    return `Cart offer: ${rule.value}% off — ${formatINR(discountAmount)} saved`
  }
  return `Cart offer: ${formatINR(rule.value)} off — ${formatINR(discountAmount)} saved`
}

/**
 * Applies the best eligible cart-level discount to the item subtotal.
 * @param {number} subtotal - sum of item final prices after item-level discounts
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').CartDiscountResult|null}
 */
export function applyCartDiscount(subtotal, rules) {
  const cartRules = getCartRules(rules)

  if (cartRules.length === 0) return null

  const eligible = cartRules.filter(
    (rule) => rule.minCartValue != null && subtotal >= rule.minCartValue
  )

  if (eligible.length === 0) return null

  const winner = eligible.reduce((best, rule) => {
    const saving = calculateDiscountAmount(subtotal, rule)
    const bestSaving = calculateDiscountAmount(subtotal, best)
    return saving > bestSaving ? rule : best
  })

  const discountAmount = calculateDiscountAmount(subtotal, winner)

  return {
    ruleId: winner.ruleId,
    discountAmount,
    minCartValue: winner.minCartValue,
    reasoning: cartOfferReasoning(winner, discountAmount),
  }
}

/**
 * Builds a complete cart summary including item and cart-level discounts.
 * @param {import('../domain/types.js').CartItem[]} cartItems
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @returns {import('../domain/types.js').CartSummary}
 */
export function buildCartSummary(cartItems, rules) {
  const items = processCartItems(cartItems, rules)
  const subtotal = itemSubtotal(items)
  const cartOffer = applyCartDiscount(subtotal, rules)
  const finalTotal = cartOffer
    ? roundRupee(subtotal - cartOffer.discountAmount)
    : subtotal

  return {
    items,
    itemSubtotal: subtotal,
    cartOffer,
    finalTotal,
  }
}
