import { TYPE } from '../domain/constants.js'
import { roundRupee } from '../utils/currency.js'
import { getMatchingRules } from './ruleMatcher.js'

/**
 * Calculates the rupee discount a rule gives on a given price.
 * Uses the provided price, not the original base price — important for stacking.
 * @param {number} price
 * @param {import('../domain/types.js').DiscountRule} rule
 * @returns {number}
 */
export function calculateDiscountAmount(price, rule) {
  if (rule.type === TYPE.PERCENTAGE) {
    return roundRupee(price * rule.value / 100)
  }
  if (rule.type === TYPE.FLAT) {
    return rule.value
  }
  return 0
}

/**
 * Builds the customer-facing reasoning string for an applied item-level rule.
 * @param {import('../domain/types.js').DiscountRule} rule
 * @returns {string}
 */
export function ruleToReasoning(rule) {
  const scopeLabel = rule.scope === 'brand' ? 'Brand' : 'Platform'
  if (rule.type === TYPE.PERCENTAGE) {
    return `${scopeLabel} offer: ${rule.value}% off`
  }
  if (rule.type === TYPE.FLAT) {
    return `${scopeLabel} offer: Rs.${rule.value} off`
  }
  return `${scopeLabel} offer applied`
}

/**
 * Builds reasoning suffix when a skipped non-stackable rule had lower savings.
 * @param {import('../domain/types.js').DiscountRule} winner
 * @param {import('../domain/types.js').DiscountRule[]} skipped
 * @param {number} basePrice
 * @returns {string}
 */
function buildBeatsSuffix(winner, skipped, basePrice) {
  if (skipped.length === 0) return ''

  const bestSkipped = skipped.reduce((best, rule) => {
    const saving = calculateDiscountAmount(basePrice, rule)
    return saving > best.saving ? { rule, saving } : best
  }, { rule: null, saving: 0 })

  if (!bestSkipped.rule) return ''

  const winnerSaving = calculateDiscountAmount(basePrice, winner)
  if (winnerSaving <= bestSkipped.saving) return ''

  if (bestSkipped.rule.type === TYPE.FLAT) {
    return ` (beats Rs.${bestSkipped.rule.value} flat)`
  }
  if (bestSkipped.rule.type === TYPE.PERCENTAGE) {
    return ` (beats ${bestSkipped.rule.value}% off)`
  }
  return ''
}

/**
 * Applies item-level discount rules to a single cart item.
 * @param {import('../domain/types.js').CartItem} item
 * @param {import('../domain/types.js').DiscountRule[]} rules - item-level rules only
 * @returns {import('../domain/types.js').ItemDiscountResult}
 */
export function applyItemDiscounts(item, rules) {
  const matchingRules = getMatchingRules(item, rules)

  if (matchingRules.length === 0) {
    return {
      itemId: item.itemId,
      product: item.product,
      brand: item.brand,
      platform: item.platform,
      basePrice: item.basePrice,
      finalPrice: item.basePrice,
      totalDiscount: 0,
      appliedRules: [],
      skippedRules: [],
      reasoning: 'No offers available',
    }
  }

  const nonStackable = matchingRules.filter((r) => !r.stackable)
  const stackable = matchingRules.filter((r) => r.stackable)

  let winner = null
  let skipped = []

  if (nonStackable.length > 0) {
    const sorted = [...nonStackable].sort(
      (a, b) =>
        calculateDiscountAmount(item.basePrice, b) -
        calculateDiscountAmount(item.basePrice, a)
    )
    winner = sorted[0]
    skipped = sorted.slice(1)
  }

  let price = item.basePrice
  const appliedRules = []
  const reasoningParts = []

  if (winner) {
    price -= calculateDiscountAmount(price, winner)
    appliedRules.push(winner.ruleId)
    const beatsSuffix = buildBeatsSuffix(winner, skipped, item.basePrice)
    reasoningParts.push(ruleToReasoning(winner) + beatsSuffix)
  }

  for (const rule of stackable) {
    price -= calculateDiscountAmount(price, rule)
    appliedRules.push(rule.ruleId)
    reasoningParts.push(ruleToReasoning(rule))
  }

  const finalPrice = roundRupee(price)

  return {
    itemId: item.itemId,
    product: item.product,
    brand: item.brand,
    platform: item.platform,
    basePrice: item.basePrice,
    finalPrice,
    totalDiscount: item.basePrice - finalPrice,
    appliedRules,
    skippedRules: skipped.map((r) => r.ruleId),
    reasoning: reasoningParts.join(' + '),
  }
}
