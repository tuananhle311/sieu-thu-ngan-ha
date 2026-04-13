/**
 * Seeded random number generator for testing
 */

let seed = Date.now()

/**
 * Set the random seed
 * @param {number} newSeed - New seed value
 */
export function setSeed(newSeed) {
  seed = newSeed
}

/**
 * Get current seed
 * @returns {number} Current seed
 */
export function getSeed() {
  return seed
}

/**
 * Generate a seeded random number between 0 and 1
 * Uses a simple linear congruential generator
 * @returns {number} Random number between 0 and 1
 */
export function seededRandom() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

/**
 * Generate a seeded random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function seededRandomInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min
}

/**
 * Pick a random element from an array using seeded random
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export function seededPick(array) {
  return array[seededRandomInt(0, array.length - 1)]
}
