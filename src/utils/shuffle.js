/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (mutates original)
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Create a shuffled copy of an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
export function shuffleCopy(array) {
  return shuffle([...array])
}
