/**
 * rulesParser.js
 *
 * Converts raw rules CSV text into DiscountRule objects.
 * Adapters perform parsing/validation only — no discount math.
 */

import Papa from 'papaparse'
import { SCOPE, VALID_SCOPES, VALID_TYPES } from '../../domain/constants.js'

/**
 * Parses the raw text of rules.csv into DiscountRule objects.
 * @param {string} csvText
 * @returns {{ data: import('../../domain/types.js').DiscountRule[], errors: string[] }}
 */
export function parseRulesCSV(csvText) {
  const { data: rows, errors: parseErrors } = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  })

  if (parseErrors.length > 0) {
    return { data: [], errors: parseErrors.map((e) => e.message) }
  }

  const data = []
  const errors = []

  rows.forEach((row, i) => {
    const rowNum = i + 2
    const missing = []

    if (!row.rule_id) missing.push('rule_id')
    if (!row.scope) missing.push('scope')
    if (row.type === undefined || row.type === '') missing.push('type')
    if (row.value === undefined || row.value === '') missing.push('value')
    if (row.stackable === undefined || row.stackable === '') missing.push('stackable')

    const scope = row.scope?.trim().toLowerCase()

    if (scope === SCOPE.BRAND || scope === SCOPE.PLATFORM) {
      if (!row.applies_to) missing.push('applies_to')
    }

    if (scope === SCOPE.CART) {
      if (row.min_cart_value === undefined || row.min_cart_value === '') {
        missing.push('min_cart_value')
      }
    }

    if (missing.length > 0) {
      errors.push(`Row ${rowNum}: missing fields — ${missing.join(', ')}`)
      return
    }

    if (!VALID_SCOPES.includes(scope)) {
      errors.push(`Row ${rowNum}: scope must be "brand", "platform", or "cart", got "${row.scope}"`)
      return
    }

    const type = row.type.trim().toLowerCase()
    if (!VALID_TYPES.includes(type)) {
      errors.push(`Row ${rowNum}: type must be "percentage" or "flat", got "${row.type}"`)
      return
    }

    const value = parseFloat(row.value)
    if (isNaN(value) || value <= 0) {
      errors.push(`Row ${rowNum}: value must be a positive number, got "${row.value}"`)
      return
    }

    const stackableStr = row.stackable.trim().toLowerCase()
    const stackable = stackableStr === 'true' || stackableStr === '1' || stackableStr === 'yes'

    let appliesTo = row.applies_to?.trim() || null
    let minCartValue = null

    if (scope === SCOPE.CART) {
      appliesTo = null
      minCartValue = parseFloat(row.min_cart_value)
      if (isNaN(minCartValue) || minCartValue <= 0) {
        errors.push(`Row ${rowNum}: min_cart_value must be a positive number, got "${row.min_cart_value}"`)
        return
      }
      minCartValue = Math.round(minCartValue)
    }

    data.push({
      ruleId: row.rule_id.trim(),
      scope,
      appliesTo,
      type,
      value,
      stackable,
      minCartValue,
    })
  })

  return { data, errors }
}
