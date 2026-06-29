/** Discount rule scope identifiers. */
export const SCOPE = {
  BRAND: 'brand',
  PLATFORM: 'platform',
  CART: 'cart',
}

/** Discount value type identifiers. */
export const TYPE = {
  PERCENTAGE: 'percentage',
  FLAT: 'flat',
}

/** Valid scope values for validation. */
export const VALID_SCOPES = Object.values(SCOPE)

/** Valid discount type values for validation. */
export const VALID_TYPES = Object.values(TYPE)
