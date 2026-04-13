/**
 * AI System
 * AI opponent logic for single player mode
 */

import { roll } from '../utils/dice.js'

export class AISystem {
  constructor(gameState) {
    this.gameState = gameState

    // AI difficulty weights (higher = more aggressive)
    this.difficultyWeights = {
      easy: { risk: 0.3, skill: 0.2, card: 0.3 },
      medium: { risk: 0.5, skill: 0.5, card: 0.5 },
      hard: { risk: 0.7, skill: 0.8, card: 0.7 }
    }

    this.difficulty = 'medium'
  }

  /**
   * Set AI difficulty
   * @param {string} level - 'easy', 'medium', or 'hard'
   */
  setDifficulty(level) {
    if (this.difficultyWeights[level]) {
      this.difficulty = level
    }
  }

  /**
   * Make a decision for AI player's turn
   * @param {Object} player - AI player
   * @returns {Object} Decision { action, params }
   */
  decideTurn(player) {
    const caves = this.gameState.get('caves')
    const ancientBeasts = this.gameState.get('ancientBeasts')

    // Priority 1: Can capture ancient beast?
    const beastDecision = this._evaluateAncientBeastCapture(player, ancientBeasts)
    if (beastDecision.shouldCapture) {
      return {
        action: 'capture_beast',
        params: beastDecision.params
      }
    }

    // Priority 2: Evaluate caves
    const caveDecision = this._evaluateCaves(player, caves)
    if (caveDecision.shouldEnter) {
      return {
        action: 'enter_cave',
        params: { caveIndex: caveDecision.bestCave }
      }
    }

    // Priority 3: Use skill if beneficial
    const skillDecision = this._evaluateSkillUse(player)
    if (skillDecision.shouldUse) {
      return {
        action: 'use_skill',
        params: skillDecision.params
      }
    }

    // Default: Pass
    return { action: 'pass', params: {} }
  }

  /**
   * Evaluate ancient beast capture opportunity
   * @private
   */
  _evaluateAncientBeastCapture(player, ancientBeasts) {
    for (let i = 0; i < ancientBeasts.length; i++) {
      const beast = ancientBeasts[i]
      if (player.canCaptureAncientBeast(beast)) {
        // Find optimal monster selection
        const selection = this._selectMonstersForBeast(player, beast)
        if (selection) {
          return {
            shouldCapture: true,
            params: {
              beastIndex: i,
              monsterIndices: selection
            }
          }
        }
      }
    }
    return { shouldCapture: false }
  }

  /**
   * Select which monsters to sacrifice for ancient beast
   * @private
   */
  _selectMonstersForBeast(player, beast) {
    const requiredElement = beast.requirement.requiredElement
    const sameElementMonsters = []
    const otherMonsters = []

    player.capturedMonsters.forEach((monster, index) => {
      if (monster.element === requiredElement) {
        sameElementMonsters.push({ monster, index })
      } else {
        otherMonsters.push({ monster, index })
      }
    })

    if (sameElementMonsters.length < 2 ||
        (sameElementMonsters.length + otherMonsters.length) < 3) {
      return null
    }

    // Select 2 of required element (prefer lower power) + 1 any (prefer lowest value)
    sameElementMonsters.sort((a, b) => a.monster.power - b.monster.power)
    otherMonsters.sort((a, b) => a.monster.power - b.monster.power)

    const selection = [
      sameElementMonsters[0].index,
      sameElementMonsters[1].index
    ]

    if (otherMonsters.length > 0) {
      selection.push(otherMonsters[0].index)
    } else {
      selection.push(sameElementMonsters[2].index)
    }

    return selection
  }

  /**
   * Evaluate which cave to enter
   * @private
   */
  _evaluateCaves(player, caves) {
    const weights = this.difficultyWeights[this.difficulty]
    let bestCave = -1
    let bestScore = -Infinity

    caves.forEach((cave, index) => {
      if (!cave.monster) return

      const score = this._scoreCave(player, cave, weights)
      if (score > bestScore && player.canAfford(cave.cost)) {
        bestScore = score
        bestCave = index
      }
    })

    // Threshold for entering (based on difficulty)
    const threshold = this.difficulty === 'easy' ? 3 :
                      this.difficulty === 'medium' ? 2 : 1

    return {
      shouldEnter: bestCave >= 0 && bestScore >= threshold,
      bestCave: bestCave,
      score: bestScore
    }
  }

  /**
   * Score a cave for decision making
   * @private
   */
  _scoreCave(player, cave, weights) {
    const monster = cave.monster
    let score = 0

    // Victory points value
    score += cave.victoryPoints * 1.5

    // Win probability (simplified)
    const avgPlayerPower = 3.5 + player.permanentPower // Average dice + power
    const avgMonsterPower = 3.5 + monster.power
    const winProb = Math.min(1, Math.max(0, 0.5 + (avgPlayerPower - avgMonsterPower) * 0.15))

    score += winProb * 5 * weights.risk

    // Element value
    switch (monster.element) {
      case 'fire':
        // Power is good for future combats
        score += 2
        break
      case 'water':
        // More cards = more options
        score += 1.5
        break
      case 'earth':
        // More chicken legs = more flexibility
        score += 1
        break
      case 'air':
        // Direct VP
        score += 2.5
        break
    }

    // Cost penalty
    score -= cave.cost * 0.5

    // Bonus for collecting elements for ancient beast
    const elementCount = player.countMonstersByElement(monster.element)
    if (elementCount === 1) {
      score += 2 // Close to having 2 for ancient beast
    }

    return score
  }

  /**
   * Evaluate skill use
   * @private
   */
  _evaluateSkillUse(player) {
    if (!player.character || player.skillUsed) {
      return { shouldUse: false }
    }

    const weights = this.difficultyWeights[this.difficulty]
    const skillId = player.character.id

    // Only evaluate skills that make sense outside combat
    switch (skillId) {
      case 10: // Capricorn - trade cards
        if (player.treasureCards.length >= 2 && Math.random() < weights.skill) {
          return {
            shouldUse: true,
            params: { discardCardIndex: 0 }
          }
        }
        break

      case 12: // Pisces - predict monster
        const elements = ['fire', 'water', 'earth', 'air']
        const neededElements = elements.filter(e => player.countMonstersByElement(e) === 1)

        if (neededElements.length > 0 && Math.random() < weights.skill) {
          return {
            shouldUse: true,
            params: { predictedElement: neededElements[0] }
          }
        }
        break
    }

    return { shouldUse: false }
  }

  /**
   * Decide combat actions (dice modification, card use, skill use)
   * @param {Object} player - AI player
   * @param {Object} combat - Combat state
   * @returns {Array} Actions to take
   */
  decideCombatActions(player, combat) {
    const actions = []
    const weights = this.difficultyWeights[this.difficulty]

    if (!combat.playerDice) {
      return actions // No dice rolled yet
    }

    // Check if we're likely to lose
    const expectedMonsterPower = 3.5 + combat.monster.power
    const currentPlayerPower = combat.playerDiceModified + player.permanentPower
    const likelyToLose = currentPlayerPower < expectedMonsterPower - 1

    // Consider using Taurus skill (set dice)
    if (player.character?.id === 2 && !player.skillUsed && player.chickenLegs >= 2) {
      if (likelyToLose && Math.random() < weights.skill) {
        actions.push({
          type: 'use_skill',
          params: { targetDiceValue: 6 }
        })
      }
    }

    // Consider using Aquarius skill (flip dice)
    if (player.character?.id === 11 && !player.skillUsed) {
      const flipped = 7 - combat.playerDiceModified
      if (flipped > combat.playerDiceModified && Math.random() < weights.skill) {
        actions.push({ type: 'flip_dice' })
      }
    }

    // Consider using dice modification cards
    if (likelyToLose && Math.random() < weights.card) {
      for (let i = 0; i < player.treasureCards.length; i++) {
        const card = player.treasureCards[i]
        if (card.effect.type === 'set_dice' && card.effect.value > combat.playerDiceModified) {
          actions.push({
            type: 'play_card',
            params: { cardIndex: i }
          })
          break
        }
      }
    }

    // Consider using auto-win cards (Kiếm, Khiên, Trượng)
    for (let i = 0; i < player.treasureCards.length; i++) {
      const card = player.treasureCards[i]
      if (card.effect.type === 'auto_win_on_dice') {
        if (card.effect.values.includes(combat.playerDiceModified)) {
          if (likelyToLose || Math.random() < weights.card * 0.5) {
            actions.push({
              type: 'play_card',
              params: { cardIndex: i }
            })
            break
          }
        }
      }
    }

    return actions
  }

  /**
   * Decide target for targeted effects
   * @param {Object} player - AI player
   * @param {string} targetType - Type of target needed
   * @returns {Object} Target selection
   */
  decideTarget(player, targetType) {
    const players = this.gameState.get('players')
    const otherPlayers = players.filter(p => p.index !== player.index && !p.isAI)

    switch (targetType) {
      case 'player':
        // Target player with highest score
        const sortedPlayers = [...otherPlayers].sort(
          (a, b) => b.victoryPoints - a.victoryPoints
        )
        return sortedPlayers[0] || otherPlayers[0]

      case 'monster':
        // Target best monster from opponent
        for (const opponent of otherPlayers) {
          if (opponent.capturedMonsters.length > 0) {
            // Prefer air monsters (VP) or fire monsters (power)
            const sorted = [...opponent.capturedMonsters].sort((a, b) => {
              const scoreA = a.element === 'air' ? 3 : a.element === 'fire' ? 2 : 1
              const scoreB = b.element === 'air' ? 3 : b.element === 'fire' ? 2 : 1
              return scoreB - scoreA
            })
            return {
              player: opponent,
              monsterIndex: opponent.capturedMonsters.indexOf(sorted[0])
            }
          }
        }
        return null

      case 'treasure':
        // Target player with most cards
        const byCards = [...otherPlayers].sort(
          (a, b) => b.treasureCards.length - a.treasureCards.length
        )
        return byCards[0]?.treasureCards.length > 0 ? byCards[0] : null

      default:
        return otherPlayers[0] || null
    }
  }

  /**
   * Decide whether to participate in optional events
   * @param {Object} player - AI player
   * @param {Object} event - Event details
   * @returns {Object} Decision
   */
  decideEventParticipation(player, event) {
    const weights = this.difficultyWeights[this.difficulty]

    switch (event.interactionType) {
      case 'shop':
        // Buy if we have extra chicken legs
        if (player.chickenLegs > event.cost.chickenLegs + 2) {
          return { participate: true }
        }
        return { participate: false }

      case 'pawn':
        // Pawn if we have many cards and need chicken legs
        if (player.treasureCards.length > 3 && player.chickenLegs < 2) {
          return {
            participate: true,
            cardIndex: 0 // Pawn first card
          }
        }
        return { participate: false }

      default:
        // Random based on difficulty
        return { participate: Math.random() < weights.risk }
    }
  }

  /**
   * Get AI thinking delay (for more human-like behavior)
   * @returns {number} Delay in milliseconds
   */
  getThinkingDelay() {
    return 500 + Math.random() * 1000
  }
}
