/**
 * Cave Entity
 * Represents a cave on the game board
 */

export class Cave {
  constructor(id, cost, victoryPoints, type = 'small') {
    this.id = id
    this.cost = cost // Chicken legs required to enter
    this.victoryPoints = victoryPoints // Points awarded on successful capture
    this.type = type // 'small' or 'ancient'
    this.monster = null // Current monster in the cave
    this.element = null // For ancient caves, the required element
  }

  /**
   * Set the monster in this cave
   * @param {Object} monster - Monster card
   */
  setMonster(monster) {
    this.monster = monster
  }

  /**
   * Remove and return the monster from this cave
   * @returns {Object} The monster that was in the cave
   */
  removeMonster() {
    const monster = this.monster
    this.monster = null
    return monster
  }

  /**
   * Check if cave has a monster
   * @returns {boolean} True if cave has a monster
   */
  hasMonster() {
    return this.monster !== null
  }

  /**
   * Check if this is an ancient beast cave
   * @returns {boolean} True if ancient cave
   */
  isAncientCave() {
    return this.type === 'ancient'
  }

  /**
   * Get cave info for UI display
   * @returns {Object} Cave information
   */
  getInfo() {
    return {
      id: this.id,
      cost: this.cost,
      victoryPoints: this.victoryPoints,
      type: this.type,
      hasMonster: this.hasMonster(),
      monster: this.monster,
      element: this.element,
    }
  }

  /**
   * Create a small cave
   * @param {number} id - Cave ID (1-5)
   * @returns {Cave} New small cave
   */
  static createSmallCave(id) {
    // Fixed cost/victory-point curve for caves 1-5: 1, 1, 2, 2, 3
    const CAVE_COSTS = [1, 1, 2, 2, 3]
    const value = CAVE_COSTS[id - 1] ?? id
    return new Cave(id, value, value, 'small')
  }

  /**
   * Create an ancient beast cave
   * @param {string} element - Element type
   * @param {Object} ancientBeast - The ancient beast
   * @returns {Cave} New ancient cave
   */
  static createAncientCave(element, ancientBeast) {
    const cave = new Cave(`ancient_${element}`, 0, 3, 'ancient')
    cave.element = element
    cave.ancientBeast = ancientBeast
    return cave
  }
}

/**
 * Create all caves for the game board
 * @param {Array} ancientBeasts - Ancient beast data
 * @returns {Object} Object containing small caves and ancient caves
 */
export function createGameCaves(ancientBeasts) {
  // Create 5 small caves
  const smallCaves = []
  for (let i = 1; i <= 5; i++) {
    smallCaves.push(Cave.createSmallCave(i))
  }

  // Create 4 ancient beast caves
  const ancientCaves = ancientBeasts.map((beast) =>
    Cave.createAncientCave(beast.element, beast)
  )

  return {
    smallCaves,
    ancientCaves,
  }
}
