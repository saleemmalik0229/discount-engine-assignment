import { describe, it, expect } from 'vitest'
import { applyItemDiscounts } from '../discountCalculator.js'
import { processFullCart } from '../discountEngine.js'
import { getItemLevelRules } from '../ruleMatcher.js'

const ITEM_RULES = [
  {
    ruleId: 'RULE-01',
    scope: 'platform',
    appliesTo: 'Amazon India',
    type: 'percentage',
    value: 15,
    stackable: false,
    minCartValue: null,
  },
  {
    ruleId: 'RULE-02',
    scope: 'brand',
    appliesTo: 'Natura Casa',
    type: 'flat',
    value: 150,
    stackable: false,
    minCartValue: null,
  },
  {
    ruleId: 'RULE-03',
    scope: 'platform',
    appliesTo: 'Flipkart',
    type: 'percentage',
    value: 10,
    stackable: true,
    minCartValue: null,
  },
]

const ALL_RULES = [
  ...ITEM_RULES,
  {
    ruleId: 'RULE-04',
    scope: 'cart',
    appliesTo: null,
    type: 'percentage',
    value: 10,
    stackable: false,
    minCartValue: 4000,
  },
]

const SAMPLE_CART = [
  { itemId: 'ITEM-01', product: 'Cushion Cover', brand: 'Natura Casa', platform: 'Amazon India', basePrice: 1299 },
  { itemId: 'ITEM-02', product: 'Bed Sheet Set', brand: 'Natura Casa', platform: 'Flipkart', basePrice: 849 },
  { itemId: 'ITEM-03', product: 'Wall Shelf', brand: 'LivSpace Pro', platform: 'Amazon India', basePrice: 599 },
  { itemId: 'ITEM-04', product: 'Ceramic Vase', brand: 'LivSpace Pro', platform: 'Noon', basePrice: 2499 },
  { itemId: 'ITEM-05', product: 'Cutting Board', brand: 'Nordic Basics', platform: 'Amazon India', basePrice: 449 },
  { itemId: 'ITEM-06', product: 'Desk Organiser', brand: 'Nordic Basics', platform: 'Flipkart', basePrice: 899 },
]

describe('applyItemDiscounts — individual items with RULE-01,02,03', () => {
  const itemRules = getItemLevelRules(ITEM_RULES)

  it('ITEM-01: 15% platform beats Rs.150 flat → Rs.1,104', () => {
    const result = applyItemDiscounts(SAMPLE_CART[0], itemRules)
    expect(result.finalPrice).toBe(1104)
    expect(result.reasoning).toContain('Platform offer: 15% off')
    expect(result.reasoning).toContain('beats Rs.150 flat')
  })

  it('ITEM-02: Rs.150 brand + 10% stackable → Rs.629', () => {
    const result = applyItemDiscounts(SAMPLE_CART[1], itemRules)
    expect(result.finalPrice).toBe(629)
    expect(result.reasoning).toBe('Brand offer: Rs.150 off + Platform offer: 10% off')
  })

  it('ITEM-03: 15% platform → Rs.509', () => {
    const result = applyItemDiscounts(SAMPLE_CART[2], itemRules)
    expect(result.finalPrice).toBe(509)
    expect(result.reasoning).toBe('Platform offer: 15% off')
  })

  it('ITEM-04: no offers → Rs.2,499', () => {
    const result = applyItemDiscounts(SAMPLE_CART[3], itemRules)
    expect(result.finalPrice).toBe(2499)
    expect(result.reasoning).toBe('No offers available')
  })

  it('ITEM-05: 15% platform → Rs.382', () => {
    const result = applyItemDiscounts(SAMPLE_CART[4], itemRules)
    expect(result.finalPrice).toBe(382)
    expect(result.reasoning).toBe('Platform offer: 15% off')
  })

  it('ITEM-06: 10% platform → Rs.809', () => {
    const result = applyItemDiscounts(SAMPLE_CART[5], itemRules)
    expect(result.finalPrice).toBe(809)
    expect(result.reasoning).toBe('Platform offer: 10% off')
  })
})

describe('processFullCart — full cart with all 4 rules', () => {
  it('produces exact expected totals', () => {
    const summary = processFullCart(SAMPLE_CART, ALL_RULES)

    expect(summary.itemSubtotal).toBe(5932)
    expect(summary.cartOffer).not.toBeNull()
    expect(summary.cartOffer.discountAmount).toBe(593)
    expect(summary.finalTotal).toBe(5339)
    expect(summary.cartOffer.reasoning).toBe('Cart offer: 10% off — Rs.593 saved')
  })
})

describe('processFullCart — cart threshold edge cases', () => {
  it('Rs.3,999 subtotal → no cart offer', () => {
    const cart = [{ itemId: 'ITEM-X', product: 'Test', brand: 'X', platform: 'Y', basePrice: 3999 }]
    const summary = processFullCart(cart, ALL_RULES)

    expect(summary.itemSubtotal).toBe(3999)
    expect(summary.cartOffer).toBeNull()
    expect(summary.finalTotal).toBe(3999)
  })

  it('Rs.4,000 subtotal → cart offer applies', () => {
    const cart = [{ itemId: 'ITEM-X', product: 'Test', brand: 'X', platform: 'Y', basePrice: 4000 }]
    const summary = processFullCart(cart, ALL_RULES)

    expect(summary.itemSubtotal).toBe(4000)
    expect(summary.cartOffer).not.toBeNull()
    expect(summary.cartOffer.discountAmount).toBe(400)
    expect(summary.finalTotal).toBe(3600)
  })
})
