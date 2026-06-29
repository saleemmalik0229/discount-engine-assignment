import { describe, it, expect } from 'vitest'
import { parseCartCSV } from '../csv/cartParser.js'

describe('parseCartCSV', () => {
  it('maps valid rows to camelCase CartItem objects', () => {
    const csv = `item_id,product,brand,platform,base_price
ITEM-01,Cushion Cover,Natura Casa,Amazon India,1299`

    const { data, errors } = parseCartCSV(csv)

    expect(errors).toEqual([])
    expect(data).toEqual([
      {
        itemId: 'ITEM-01',
        product: 'Cushion Cover',
        brand: 'Natura Casa',
        platform: 'Amazon India',
        basePrice: 1299,
      },
    ])
  })

  it('normalises headers with spaces and mixed case', () => {
    const csv = `Item ID,Product,Brand,Platform,Base Price
X-1,Widget,Acme,Flipkart,499.7`

    const { data, errors } = parseCartCSV(csv)

    expect(errors).toEqual([])
    expect(data[0].itemId).toBe('X-1')
    expect(data[0].basePrice).toBe(500)
  })

  it('returns row-level errors for missing fields', () => {
    const csv = `item_id,product,brand,platform,base_price
ITEM-OK,Widget,Acme,Flipkart,100
,Missing,,,`

    const { data, errors } = parseCartCSV(csv)

    expect(data).toHaveLength(1)
    expect(data[0].itemId).toBe('ITEM-OK')
    expect(errors[0]).toMatch(/^Row 3:/)
    expect(errors[0]).toContain('missing fields')
  })

  it('rejects non-positive base_price', () => {
    const csv = `item_id,product,brand,platform,base_price
ITEM-X,Widget,Acme,Flipkart,0`

    const { data, errors } = parseCartCSV(csv)

    expect(data).toEqual([])
    expect(errors[0]).toContain('base_price must be a positive number')
  })
})
