/**
 * Dice utility functions
 */

/**
 * Roll a single six-sided die
 * @returns {number} Random number between 1 and 6
 */
export function roll() {
  return Math.floor(Math.random() * 6) + 1
}

/**
 * Roll multiple dice
 * @param {number} count - Number of dice to roll
 * @returns {number[]} Array of dice results
 */
export function rollMultiple(count) {
  const results = []
  for (let i = 0; i < count; i++) {
    results.push(roll())
  }
  return results
}

/**
 * Get the sum of multiple dice rolls
 * @param {number} count - Number of dice to roll
 * @returns {number} Sum of all dice
 */
export function rollSum(count) {
  return rollMultiple(count).reduce((sum, val) => sum + val, 0)
}

/**
 * Flip a dice value (opposite face)
 * @param {number} value - Dice value to flip (1-6)
 * @returns {number} Flipped value
 */
export function flip(value) {
  return 7 - value
}

/**
 * Check if a dice value is even
 * @param {number} value - Dice value
 * @returns {boolean} True if even
 */
export function isEven(value) {
  return value % 2 === 0
}

/**
 * Check if a dice value is odd
 * @param {number} value - Dice value
 * @returns {boolean} True if odd
 */
export function isOdd(value) {
  return value % 2 !== 0
}
