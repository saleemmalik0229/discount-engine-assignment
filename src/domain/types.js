/**
 * @typedef {Object} DiscountRule
 * @property {string} ruleId - e.g. "RULE-01"
 * @property {'brand'|'platform'|'cart'} scope
 * @property {string|null} appliesTo - brand/platform name; null for cart scope
 * @property {'percentage'|'flat'} type
 * @property {number} value - percentage as integer (15 = 15%), flat in rupees
 * @property {boolean} stackable
 * @property {number|null} minCartValue - minimum cart subtotal for cart-scope rules
 */

/**
 * @typedef {Object} CartItem
 * @property {string} itemId - e.g. "ITEM-01"
 * @property {string} product
 * @property {string} brand
 * @property {string} platform
 * @property {number} basePrice - in rupees
 */

/**
 * @typedef {Object} ItemDiscountResult
 * @property {string} itemId
 * @property {string} product
 * @property {string} brand
 * @property {string} platform
 * @property {number} basePrice
 * @property {number} finalPrice
 * @property {number} totalDiscount
 * @property {string[]} appliedRules
 * @property {string[]} skippedRules
 * @property {string} reasoning - customer-readable explanation
 */

/**
 * @typedef {Object} CartDiscountResult
 * @property {string} ruleId
 * @property {number} discountAmount
 * @property {number} minCartValue
 * @property {string} reasoning - e.g. "Cart offer: 10% off — Rs.593 saved"
 */

/**
 * @typedef {Object} CartSummary
 * @property {ItemDiscountResult[]} items
 * @property {number} itemSubtotal - sum of item final prices before cart offer
 * @property {CartDiscountResult|null} cartOffer - null if threshold not met or no cart rules
 * @property {number} finalTotal
 */

export {}
