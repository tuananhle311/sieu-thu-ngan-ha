/**
 * Skill System
 * Handles character skill activation and effects
 */

import { roll } from '../utils/dice.js'

export class SkillSystem {
  constructor(gameState, cardSystem) {
    this.gameState = gameState
    this.cardSystem = cardSystem
    this.skillHandlers = new Map()
    this._registerSkillHandlers()
  }

  /**
   * Register all skill handlers
   * @private
   */
  _registerSkillHandlers() {
    // 1. Aries - Chí mạng (Auto-win on even dice) - Handled in CombatSystem
    this.skillHandlers.set(1, this._handleAries.bind(this))

    // 2. Taurus - Giả kim thuật (Set dice to any value)
    this.skillHandlers.set(2, this._handleTaurus.bind(this))

    // 3. Gemini - Sao chép (Copy opponent's treasure card)
    this.skillHandlers.set(3, this._handleGemini.bind(this))

    // 4. Cancer - Chúc phúc (Support ally in combat)
    this.skillHandlers.set(4, this._handleCancer.bind(this))

    // 5. Leo - Tinh hoa (Redirect event to single player)
    this.skillHandlers.set(5, this._handleLeo.bind(this))

    // 6. Virgo - Đặt bẫy (Remove monster power bonus)
    this.skillHandlers.set(6, this._handleVirgo.bind(this))

    // 7. Libra - Triệu hồi (Borrow fire power from caves)
    this.skillHandlers.set(7, this._handleLibra.bind(this))

    // 8. Scorpio - Hố đen (Steal monster on specific dice)
    this.skillHandlers.set(8, this._handleScorpio.bind(this))

    // 9. Sagittarius - Cường hoá (Dice-based power bonus)
    this.skillHandlers.set(9, this._handleSagittarius.bind(this))

    // 10. Capricorn - Cổng lượng tử (Trade 1 treasure for 2)
    this.skillHandlers.set(10, this._handleCapricorn.bind(this))

    // 11. Aquarius - Ảo thuật (Flip dice) - Handled in CombatSystem
    this.skillHandlers.set(11, this._handleAquarius.bind(this))

    // 12. Pisces - Kết nối giấc mơ (Predict monster element)
    this.skillHandlers.set(12, this._handlePisces.bind(this))
  }

  /**
   * Check if a skill can be used
   * @param {Object} player - Player
   * @param {Object} context - Current context
   * @returns {Object} { canUse: boolean, reason: string }
   */
  canUseSkill(player, context = {}) {
    if (!player.character) {
      return { canUse: false, reason: 'No character selected' }
    }

    if (player.skillUsed) {
      return { canUse: false, reason: 'Skill already used' }
    }

    const character = player.character
    const timing = character.timing

    // Check timing
    if (timing === 'in_turn' && !context.isPlayerTurn) {
      return { canUse: false, reason: 'Can only use during your turn' }
    }

    // Skill-specific checks
    const skillId = character.id
    switch (skillId) {
      case 2: // Taurus - needs 2 chicken legs
        if (player.chickenLegs < 2) {
          return { canUse: false, reason: 'Need 2 chicken legs' }
        }
        if (!context.hasDiceRoll) {
          return { canUse: false, reason: 'No dice to modify' }
        }
        break

      case 3: // Gemini - needs opponent to have played treasure
        if (!context.lastPlayedTreasure) {
          return { canUse: false, reason: 'No treasure card to copy' }
        }
        break

      case 4: // Cancer - needs other player in combat
        if (!context.otherPlayerCombat) {
          return { canUse: false, reason: 'No other player in combat' }
        }
        break

      case 5: // Leo - needs event phase
        if (!context.eventPhase) {
          return { canUse: false, reason: 'Only during event phase' }
        }
        break

      case 6: // Virgo - needs 1 chicken leg
        if (player.chickenLegs < 1) {
          return { canUse: false, reason: 'Need 1 chicken leg' }
        }
        if (!context.inCombat) {
          return { canUse: false, reason: 'Only during combat' }
        }
        break

      case 10: // Capricorn - needs at least 1 treasure card
        if (player.treasureCards.length < 1) {
          return { canUse: false, reason: 'Need at least 1 treasure card' }
        }
        break

      case 11: // Aquarius - needs dice roll
        if (!context.hasDiceRoll) {
          return { canUse: false, reason: 'No dice to flip' }
        }
        break
    }

    return { canUse: true }
  }

  /**
   * Use a character skill
   * @param {Object} player - Player using skill
   * @param {Object} context - Context for skill use
   * @returns {Object} Result of skill use
   */
  useSkill(player, context = {}) {
    const check = this.canUseSkill(player, context)
    if (!check.canUse) {
      return { success: false, error: check.reason }
    }

    const handler = this.skillHandlers.get(player.character.id)
    if (!handler) {
      return { success: false, error: 'Skill not implemented' }
    }

    const result = handler(player, context)

    if (result.success) {
      player.useSkill()

      this.gameState.addToHistory({
        type: 'use_skill',
        playerIndex: player.index,
        skillId: player.character.id,
        skillName: player.character.skillName,
        result: result
      })
    }

    return result
  }

  // Skill Handlers

  _handleAries(player, context) {
    // Passive skill - handled in CombatSystem
    return { success: true, message: 'Aries skill is passive (auto-win on even dice)' }
  }

  _handleTaurus(player, context) {
    // Pay cost
    player.removeChickenLegs(2)

    // Set dice value
    const newValue = context.targetDiceValue
    if (newValue < 1 || newValue > 6) {
      return { success: false, error: 'Invalid dice value' }
    }

    context.modifiedDiceResult = newValue
    return {
      success: true,
      newDiceValue: newValue,
      message: `Dice set to ${newValue}`
    }
  }

  _handleGemini(player, context) {
    const cardToCopy = context.lastPlayedTreasure
    if (!cardToCopy) {
      return { success: false, error: 'No card to copy' }
    }

    // Create a copy of the card
    const copiedCard = { ...cardToCopy, instanceId: `copy_${Date.now()}` }
    player.addTreasureCard(copiedCard)

    return {
      success: true,
      copiedCard: copiedCard,
      message: `Copied ${cardToCopy.name}`
    }
  }

  _handleCancer(player, context) {
    // Roll support dice
    const supportDice = roll()

    // Add to combat
    if (context.combat) {
      context.combat.allySupport = {
        player: player,
        power: supportDice,
        source: 'Chúc phúc (Cự Giải)'
      }
    }

    return {
      success: true,
      supportDice: supportDice,
      message: `Support dice: ${supportDice}`
    }
  }

  _handleLeo(player, context) {
    if (!context.targetPlayer) {
      return { success: false, error: 'Must select target player' }
    }

    context.eventTarget = context.targetPlayer
    return {
      success: true,
      targetPlayer: context.targetPlayer,
      message: `Event redirected to ${context.targetPlayer.name}`
    }
  }

  _handleVirgo(player, context) {
    // Pay cost
    player.removeChickenLegs(1)

    // Add effect to combat
    if (context.combat) {
      context.combat.pendingEffects.push({
        type: 'remove_monster_power',
        source: 'Đặt bẫy (Xử Nữ)'
      })
    }

    return {
      success: true,
      message: 'Monster power bonus removed'
    }
  }

  _handleLibra(player, context) {
    // Count fire monsters in caves
    const caves = this.gameState.get('caves')
    let firePower = 0

    for (const cave of caves) {
      if (cave.monster && cave.monster.element === 'fire') {
        firePower += 1
      }
    }

    // Add to combat
    if (context.combat) {
      context.combat.pendingEffects.push({
        type: 'combat_power_bonus',
        value: firePower,
        source: 'Triệu hồi (Thiên Bình)'
      })
    }

    return {
      success: true,
      firePower: firePower,
      message: `Borrowed ${firePower} fire power from caves`
    }
  }

  _handleScorpio(player, context) {
    const chosenNumbers = context.chosenDiceNumbers
    if (!chosenNumbers || chosenNumbers.length !== 2) {
      return { success: false, error: 'Must choose exactly 2 dice numbers' }
    }

    // Roll dice
    const diceResult = roll()

    if (chosenNumbers.includes(diceResult)) {
      // Success - can steal a monster
      return {
        success: true,
        diceResult: diceResult,
        canSteal: true,
        message: `Rolled ${diceResult}! Choose a monster to steal.`
      }
    } else {
      return {
        success: true,
        diceResult: diceResult,
        canSteal: false,
        message: `Rolled ${diceResult}. No monster stolen.`
      }
    }
  }

  _handleSagittarius(player, context) {
    // Roll dice for power bonus
    const diceResult = roll()
    let powerBonus = 0

    if (diceResult <= 2) {
      powerBonus = 1
    } else if (diceResult <= 4) {
      powerBonus = 2
    } else {
      powerBonus = 3
    }

    // Add to combat
    if (context.combat) {
      context.combat.pendingEffects.push({
        type: 'combat_power_bonus',
        value: powerBonus,
        source: 'Cường hoá (Nhân Mã)'
      })
    }

    return {
      success: true,
      diceResult: diceResult,
      powerBonus: powerBonus,
      message: `Rolled ${diceResult}, +${powerBonus} power`
    }
  }

  _handleCapricorn(player, context) {
    const cardIndex = context.discardCardIndex
    if (cardIndex === undefined || cardIndex < 0 || cardIndex >= player.treasureCards.length) {
      return { success: false, error: 'Must select a card to discard' }
    }

    // Discard one card
    const discarded = player.removeTreasureCard(cardIndex)
    this.cardSystem.discardCard('treasure', discarded)

    // Draw 2 cards
    const drawn = []
    for (let i = 0; i < 2; i++) {
      const card = this.cardSystem.drawCard('treasure')
      if (card) {
        player.addTreasureCard(card)
        drawn.push(card)
      }
    }

    return {
      success: true,
      discarded: discarded,
      drawn: drawn,
      message: `Discarded ${discarded.name}, drew ${drawn.length} cards`
    }
  }

  _handleAquarius(player, context) {
    // Flip is handled in CombatSystem
    return {
      success: true,
      message: 'Dice can now be flipped'
    }
  }

  _handlePisces(player, context) {
    const predictedElement = context.predictedElement
    if (!predictedElement || !['fire', 'water', 'earth', 'air'].includes(predictedElement)) {
      return { success: false, error: 'Must predict an element' }
    }

    // Draw a monster from deck
    const monster = this.cardSystem.drawCard('monster')
    if (!monster) {
      return { success: false, error: 'No monsters in deck' }
    }

    const correct = monster.element === predictedElement

    if (correct) {
      // Player keeps the monster
      player.addMonster(monster)
      return {
        success: true,
        monster: monster,
        correct: true,
        message: `Correct! Captured ${monster.name}`
      }
    } else {
      // Monster goes to discard
      this.cardSystem.discardCard('monster', monster)
      return {
        success: true,
        monster: monster,
        correct: false,
        message: `Wrong! ${monster.name} was ${monster.element}`
      }
    }
  }

  /**
   * Get skill info for UI display
   * @param {Object} player - Player
   * @returns {Object} Skill info
   */
  getSkillInfo(player) {
    if (!player.character) return null

    const character = player.character
    return {
      id: character.id,
      name: character.skillName,
      description: character.skillDescription,
      timing: character.timing,
      isUsed: player.skillUsed,
      timingText: character.timing === 'anytime' ? 'Bất cứ lúc nào' : 'Trong lượt'
    }
  }
}
