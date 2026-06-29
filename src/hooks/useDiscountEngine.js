import { useMemo } from 'react'
import { processFullCart } from '../engine/discountEngine.js'

/**
 * Reactively computes cart discount summary whenever rules or cart items change.
 * @param {import('../domain/types.js').DiscountRule[]} rules
 * @param {import('../domain/types.js').CartItem[]} cartItems
 * @param {boolean} [enabled=true] - when false, returns null (before user triggers calculation)
 * @returns {import('../domain/types.js').CartSummary|null}
 */
export function useDiscountEngine(rules, cartItems, enabled = true) {
  return useMemo(() => {
    if (!enabled || rules.length === 0 || cartItems.length === 0) {
      return null
    }
    return processFullCart(cartItems, rules)
  }, [rules, cartItems, enabled])
}
