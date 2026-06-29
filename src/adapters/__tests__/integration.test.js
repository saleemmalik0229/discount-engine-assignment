/**
 * End-to-end integration: sample CSV files → parsers → discount engine.
 * Uses Node fs — runs only under Vitest (node environment).
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { describe, it, expect } from 'vitest'
import { parseRulesCSV, parseCartCSV } from '../index.js'
import { processFullCart } from '../../engine/discountEngine.js'

const SAMPLE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../sample-data')

describe('sample-data integration — CSV → engine', () => {
  it('parses rules.csv and cart.csv with zero errors', () => {
    const rulesText = readFileSync(join(SAMPLE_DIR, 'rules.csv'), 'utf-8')
    const cartText = readFileSync(join(SAMPLE_DIR, 'cart.csv'), 'utf-8')

    const rulesResult = parseRulesCSV(rulesText)
    const cartResult = parseCartCSV(cartText)

    expect(rulesResult.errors).toEqual([])
    expect(cartResult.errors).toEqual([])
    expect(rulesResult.data).toHaveLength(4)
    expect(cartResult.data).toHaveLength(6)
  })

  it('produces finalTotal Rs.5,339 from sample files', () => {
    const rulesText = readFileSync(join(SAMPLE_DIR, 'rules.csv'), 'utf-8')
    const cartText = readFileSync(join(SAMPLE_DIR, 'cart.csv'), 'utf-8')

    const { data: rules } = parseRulesCSV(rulesText)
    const { data: cartItems } = parseCartCSV(cartText)

    const summary = processFullCart(cartItems, rules)

    expect(summary.itemSubtotal).toBe(5932)
    expect(summary.cartOffer).not.toBeNull()
    expect(summary.cartOffer.discountAmount).toBe(593)
    expect(summary.finalTotal).toBe(5339)
  })
})
