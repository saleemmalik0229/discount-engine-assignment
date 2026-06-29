import { describe, it, expect } from 'vitest'
import { parseRulesCSV } from '../csv/rulesParser.js'

describe('parseRulesCSV', () => {
  it('maps valid rows to camelCase DiscountRule objects', () => {
    const csv = `rule_id,scope,applies_to,type,value,stackable,min_cart_value
RULE-01,platform,Amazon India,percentage,15,false,
RULE-04,cart,,percentage,10,false,4000`

    const { data, errors } = parseRulesCSV(csv)

    expect(errors).toEqual([])
    expect(data).toHaveLength(2)
    expect(data[0]).toEqual({
      ruleId: 'RULE-01',
      scope: 'platform',
      appliesTo: 'Amazon India',
      type: 'percentage',
      value: 15,
      stackable: false,
      minCartValue: null,
    })
    expect(data[1]).toEqual({
      ruleId: 'RULE-04',
      scope: 'cart',
      appliesTo: null,
      type: 'percentage',
      value: 10,
      stackable: false,
      minCartValue: 4000,
    })
  })

  it('normalises headers with spaces and mixed case', () => {
    const csv = `Rule ID,Scope,Applies To,Type,Value,Stackable,Min Cart Value
R-1,Brand,Acme,Percentage,10,Yes,`

    const { data, errors } = parseRulesCSV(csv)

    expect(errors).toEqual([])
    expect(data[0].ruleId).toBe('R-1')
    expect(data[0].scope).toBe('brand')
    expect(data[0].stackable).toBe(true)
  })

  it('returns row-level errors and keeps valid rows', () => {
    const csv = `rule_id,scope,applies_to,type,value,stackable,min_cart_value
RULE-OK,platform,Amazon,percentage,10,false,
,badscope,,flat,50,false,`

    const { data, errors } = parseRulesCSV(csv)

    expect(data).toHaveLength(1)
    expect(data[0].ruleId).toBe('RULE-OK')
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toMatch(/^Row 3:/)
  })

  it('requires applies_to for brand and platform scope', () => {
    const csv = `rule_id,scope,applies_to,type,value,stackable,min_cart_value
RULE-X,brand,,percentage,10,false,`

    const { data, errors } = parseRulesCSV(csv)

    expect(data).toEqual([])
    expect(errors[0]).toContain('applies_to')
  })

  it('requires min_cart_value for cart scope', () => {
    const csv = `rule_id,scope,applies_to,type,value,stackable,min_cart_value
RULE-X,cart,,percentage,10,false,`

    const { data, errors } = parseRulesCSV(csv)

    expect(data).toEqual([])
    expect(errors[0]).toContain('min_cart_value')
  })

  it('rejects invalid scope and type values', () => {
    const csv = `rule_id,scope,applies_to,type,value,stackable,min_cart_value
R1,invalid,Acme,percentage,10,false,
R2,platform,Acme,invalid,10,false,`

    const { data, errors } = parseRulesCSV(csv)

    expect(data).toEqual([])
    expect(errors[0]).toContain('scope must be')
    expect(errors[1]).toContain('type must be')
  })
})
