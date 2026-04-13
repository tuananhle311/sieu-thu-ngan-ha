/**
 * Player Entity
 * Represents a player in the game
 */

export class Player {
  constructor(index, name, isAI = false) {
    this.index = index
    this.name = name
    this.isAI = isAI

    // Character (set during character selection)
    this.character = null
    this.skillUsed = false

    // Resources
    this.chickenLegs = 0
    this.victoryPoints = 0
    this.permanentPower = 0

    // Cards
    this.treasureCards = []
    this.capturedMonsters = []

    // Ancient beasts captured
    this.ancientBeasts = []

    // Turn state
    this.hasActedThisTurn = false
    this.skipNextTurn = false
  }

  /**
   * Set the player's character
   * @param {Object} character - Character data
   */
  setCharacter(character) {
    this.character = character
    this.skillUsed = false
  }

  /**
   * Give starting resources
   * @param {number} chickenLegs - Starting chicken legs
   * @param {Array} treasureCards - Starting treasure cards
   */
  giveStartingResources(chickenLegs, treasureCards) {
    this.chickenLegs = chickenLegs
    this.treasureCards = [...treasureCards]
  }

  /**
   * Add chicken legs
   * @param {number} amount - Amount to add
   */
  addChickenLegs(amount) {
    this.chickenLegs += amount
  }

  /**
   * Remove chicken legs
   * @param {number} amount - Amount to remove
   * @returns {boolean} True if successful
   */
  removeChickenLegs(amount) {
    if (this.chickenLegs >= amount) {
      this.chickenLegs -= amount
      return true
    }
    return false
  }

  /**
   * Check if player can afford a cost
   * @param {number} cost - Cost in chicken legs
   * @returns {boolean} True if can afford
   */
  canAfford(cost) {
    return this.chickenLegs >= cost
  }

  /**
   * Add victory points
   * @param {number} points - Points to add
   */
  addVictoryPoints(points) {
    this.victoryPoints += points
  }

  /**
   * Add permanent power bonus
   * @param {number} power - Power to add
   */
  addPermanentPower(power) {
    this.permanentPower += power
  }

  /**
   * Add a treasure card to hand
   * @param {Object} card - Treasure card
   */
  addTreasureCard(card) {
    this.treasureCards.push(card)
  }

  /**
   * Remove a treasure card from hand
   * @param {number} index - Card index
   * @returns {Object} Removed card
   */
  removeTreasureCard(index) {
    return this.treasureCards.splice(index, 1)[0]
  }

  /**
   * Remove a specific treasure card from hand
   * @param {Object} card - Card to remove
   * @returns {Object|null} Removed card or null
   */
  removeTreasureCardById(cardId) {
    const index = this.treasureCards.findIndex((c) => c.id === cardId)
    if (index !== -1) {
      return this.treasureCards.splice(index, 1)[0]
    }
    return null
  }

  /**
   * Add a captured monster
   * @param {Object} monster - Monster card
   */
  addMonster(monster) {
    this.capturedMonsters.push(monster)
  }

  /**
   * Remove a monster from collection
   * @param {number} index - Monster index
   * @returns {Object} Removed monster
   */
  removeMonster(index) {
    return this.capturedMonsters.splice(index, 1)[0]
  }

  /**
   * Get monsters by element
   * @param {string} element - Element type
   * @returns {Array} Monsters of that element
   */
  getMonstersByElement(element) {
    return this.capturedMonsters.filter((m) => m.element === element)
  }

  /**
   * Count monsters by element
   * @param {string} element - Element type
   * @returns {number} Count
   */
  countMonstersByElement(element) {
    return this.getMonstersByElement(element).length
  }

  /**
   * Check if player can capture an ancient beast
   * @param {Object} beast - Ancient beast
   * @returns {boolean} True if requirements met
   */
  canCaptureAncientBeast(beast) {
    const requirement = beast.requirement
    const sameElementCount = this.countMonstersByElement(
      requirement.requiredElement
    )
    const totalMonsters = this.capturedMonsters.length

    return (
      sameElementCount >= requirement.sameElement &&
      totalMonsters >= requirement.sameElement + requirement.anyElement
    )
  }

  /**
   * Add an ancient beast
   * @param {Object} beast - Ancient beast
   */
  addAncientBeast(beast) {
    this.ancientBeasts.push(beast)
  }

  /**
   * Use character skill
   * @returns {boolean} True if skill was available to use
   */
  useSkill() {
    if (!this.skillUsed) {
      this.skillUsed = true
      return true
    }
    return false
  }

  /**
   * Refresh character skill (make it usable again)
   */
  refreshSkill() {
    this.skillUsed = false
  }

  /**
   * Check if skill is available
   * @returns {boolean} True if skill can be used
   */
  canUseSkill() {
    return !this.skillUsed && this.character !== null
  }

  /**
   * Start a new turn
   */
  startTurn() {
    this.hasActedThisTurn = false
  }

  /**
   * End turn
   */
  endTurn() {
    this.hasActedThisTurn = true
  }

  /**
   * Calculate total combat power (excluding dice)
   * @returns {number} Base combat power
   */
  getBaseCombatPower() {
    return this.permanentPower
  }

  /**
   * Get player summary for UI
   * @returns {Object} Player summary
   */
  getSummary() {
    return {
      index: this.index,
      name: this.name,
      isAI: this.isAI,
      character: this.character
        ? {
            id: this.character.id,
            name: this.character.name,
            skillName: this.character.skillName,
          }
        : null,
      chickenLegs: this.chickenLegs,
      victoryPoints: this.victoryPoints,
      permanentPower: this.permanentPower,
      treasureCardCount: this.treasureCards.length,
      monsterCount: this.capturedMonsters.length,
      ancientBeastCount: this.ancientBeasts.length,
      skillUsed: this.skillUsed,
    }
  }

  /**
   * Serialize player for save/load
   * @returns {Object} Serialized player
   */
  serialize() {
    return {
      index: this.index,
      name: this.name,
      isAI: this.isAI,
      character: this.character,
      skillUsed: this.skillUsed,
      chickenLegs: this.chickenLegs,
      victoryPoints: this.victoryPoints,
      permanentPower: this.permanentPower,
      treasureCards: this.treasureCards,
      capturedMonsters: this.capturedMonsters,
      ancientBeasts: this.ancientBeasts,
    }
  }

  /**
   * Deserialize player from saved data
   * @param {Object} data - Saved player data
   */
  static deserialize(data) {
    const player = new Player(data.index, data.name, data.isAI)
    player.character = data.character
    player.skillUsed = data.skillUsed
    player.chickenLegs = data.chickenLegs
    player.victoryPoints = data.victoryPoints
    player.permanentPower = data.permanentPower
    player.treasureCards = data.treasureCards
    player.capturedMonsters = data.capturedMonsters
    player.ancientBeasts = data.ancientBeasts
    return player
  }
}
