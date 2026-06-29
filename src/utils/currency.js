/**
 * Rounds a rupee amount to the nearest integer.
 * @param {number} amount
 * @returns {number}
 */
export function roundRupee(amount) {
  return Math.round(amount)
}

/**
 * Formats a number as Indian Rupees (en-IN locale).
 * @param {number} amount
 * @returns {string} e.g. "Rs.1,299"
 */
export function formatINR(amount) {
  return `Rs.${roundRupee(amount).toLocaleString('en-IN')}`
}
