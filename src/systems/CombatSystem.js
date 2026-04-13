/**
 * Combat System
 * Handles dice rolling, power calculation, and combat resolution
 * Implements combat flow as documented in game.md section 4.4.4
 */

import { roll, isEven, flip } from '../utils/dice.js'

// Combat flow states (matching GameFlowController)
export const COMBAT_FLOW = {
  PAY_COST: 'pay_cost',
  PLAYER_ROLL: 'player_roll',
  PLAYER_MODIFY: 'player_modify',
  CALCULATE_PLAYER: 'calculate_player_power',
  MONSTER_ROLL: 'monster_roll',
  CALCULATE_MONSTER: 'calculate_monster_power',
  COMPARE: 'compare_powers',
  APPLY_RESULT: 'apply_result',
  END: 'end_combat'
}

export class CombatSystem {
  constructor(gameState, cardSystem) {
    this.gameState = gameState
    this.cardSystem = cardSystem
    this.currentCombatFlow = null
  }

  /**
   * Get current combat flow state
   */
  getCombatFlowState() {
    return this.currentCombatFlow
  }

  /**
   * Start a new combat (4.4.4 Step 1: PAY_COST)
   * @param {Object} player - Attacking player
   * @param {Object} cave - Cave being entered
   * @returns {Object} Combat state
   */
  startCombat(player, cave) {
    this.currentCombatFlow = COMBAT_FLOW.PAY_COST

    const combat = {
      player: player,
      playerIndex: player.index,
      cave: cave,
      monster: cave.monster,
      cost: cave.cost,
      phase: 'rolling', // rolling, modifying, resolved
      flowState: this.currentCombatFlow,
      playerDice: null,
      playerDiceModified: null,
      monsterDice: null,
      playerPower: 0,
      monsterPower: 0,
      modifiers: [],
      result: null,
      rewards: null,
      // Flags for special effects
      autoWin: false,
      autoLose: false,
      allySupport: null,
      pendingEffects: [],
      // Timing windows for cards/skills
      canModifyDice: false,
      canUseSkills: true,
      canPlayCards: true
    }

    this.gameState.set('combat', combat)
    return combat
  }

  /**
   * Roll player's dice (4.4.4 Step 2: PLAYER_ROLL)
   * @param {Object} combat - Combat state
   * @returns {number} Dice result
   */
  rollPlayerDice(combat) {
    this.currentCombatFlow = COMBAT_FLOW.PLAYER_ROLL

    const diceResult = roll()
    combat.playerDice = diceResult
    combat.playerDiceModified = diceResult
    combat.phase = 'player_rolled'
    combat.flowState = this.currentCombatFlow
    combat.canModifyDice = true // Open timing window for dice modification

    this.gameState.set('combat', { ...combat })

    // Transition to PLAYER_MODIFY state
    this.currentCombatFlow = COMBAT_FLOW.PLAYER_MODIFY
    combat.flowState = this.currentCombatFlow

    return diceResult
  }

  /**
   * Roll monster's dice (4.4.4 Step 4: MONSTER_ROLL)
   * @param {Object} combat - Combat state
   * @returns {number} Dice result
   */
  rollMonsterDice(combat) {
    this.currentCombatFlow = COMBAT_FLOW.MONSTER_ROLL

    const diceResult = roll()
    combat.monsterDice = diceResult
    combat.phase = 'monster_rolled'
    combat.flowState = this.currentCombatFlow
    combat.canModifyDice = false // Close dice modification window

    this.gameState.set('combat', { ...combat })
    return diceResult
  }

  /**
   * Modify player dice with card or skill
   * @param {Object} combat - Combat state
   * @param {number} newValue - New dice value
   * @param {string} source - Source of modification (card name or skill)
   */
  modifyPlayerDice(combat, newValue, source) {
    combat.playerDiceModified = newValue
    combat.modifiers.push({
      type: 'dice_modify',
      target: 'player',
      from: combat.playerDice,
      to: newValue,
      source: source
    })
    this.gameState.set('combat', { ...combat })
  }

  /**
   * Apply Aquarius skill (flip dice)
   * @param {Object} combat - Combat state
   */
  flipPlayerDice(combat) {
    const flipped = flip(combat.playerDiceModified)
    combat.modifiers.push({
      type: 'dice_flip',
      target: 'player',
      from: combat.playerDiceModified,
      to: flipped,
      source: 'Ảo thuật (Bảo Bình)'
    })
    combat.playerDiceModified = flipped
    this.gameState.set('combat', { ...combat })
  }

  /**
   * Calculate player power
   * @param {Object} combat - Combat state
   * @returns {number} Player power
   */
  calculatePlayerPower(combat) {
    const player = combat.player
    let power = combat.playerDiceModified

    // Add permanent power
    power += player.permanentPower

    // Add ancient beast combat bonuses
    for (const beast of player.ancientBeasts) {
      if (beast.dailyBonus.type === 'combatPower') {
        power += beast.dailyBonus.value
        combat.modifiers.push({
          type: 'power_bonus',
          value: beast.dailyBonus.value,
          source: beast.name
        })
      }
    }

    // Apply any pending combat modifiers from cards
    for (const effect of combat.pendingEffects) {
      if (effect.type === 'combat_power_bonus') {
        power += effect.value
        combat.modifiers.push({
          type: 'power_bonus',
          value: effect.value,
          source: effect.source
        })
      }
    }

    // Ally support (Cancer skill or card effect)
    if (combat.allySupport) {
      power += combat.allySupport.power
      combat.modifiers.push({
        type: 'ally_support',
        value: combat.allySupport.power,
        source: combat.allySupport.source
      })
    }

    combat.playerPower = power
    return power
  }

  /**
   * Calculate monster power
   * @param {Object} combat - Combat state
   * @returns {number} Monster power
   */
  calculateMonsterPower(combat) {
    let power = combat.monsterDice + combat.monster.power

    // Check if Virgo skill removed monster power
    for (const effect of combat.pendingEffects) {
      if (effect.type === 'remove_monster_power') {
        power = combat.monsterDice // Only dice, no base power
        combat.modifiers.push({
          type: 'power_removed',
          value: -combat.monster.power,
          source: effect.source
        })
      }
    }

    combat.monsterPower = power
    return power
  }

  /**
   * Check for auto-win conditions
   * @param {Object} combat - Combat state
   * @returns {boolean} True if auto-win
   */
  checkAutoWin(combat) {
    const player = combat.player
    const diceValue = combat.playerDiceModified

    // Aries skill: even dice = auto win
    if (player.character && player.character.id === 1) {
      if (isEven(diceValue) && !player.skillUsed) {
        combat.autoWin = true
        combat.modifiers.push({
          type: 'auto_win',
          source: 'Chí mạng (Bạch Dương)',
          diceValue: diceValue
        })
        player.useSkill()
        return true
      }
    }

    // Check for auto-win cards (Trượng, Khiên, Kiếm)
    for (const effect of combat.pendingEffects) {
      if (effect.type === 'auto_win_on_dice' && effect.values.includes(diceValue)) {
        combat.autoWin = true
        combat.modifiers.push({
          type: 'auto_win',
          source: effect.source,
          diceValue: diceValue
        })
        return true
      }
    }

    return false
  }

  /**
   * Resolve combat (4.4.4 Steps 3-7)
   * @param {Object} combat - Combat state
   * @returns {Object} Combat result
   */
  resolveCombat(combat) {
    // Step 3: Calculate player power
    this.currentCombatFlow = COMBAT_FLOW.CALCULATE_PLAYER
    combat.flowState = this.currentCombatFlow
    this.calculatePlayerPower(combat)

    // Step 5: Calculate monster power
    this.currentCombatFlow = COMBAT_FLOW.CALCULATE_MONSTER
    combat.flowState = this.currentCombatFlow
    this.calculateMonsterPower(combat)

    // Step 6: Compare powers
    this.currentCombatFlow = COMBAT_FLOW.COMPARE
    combat.flowState = this.currentCombatFlow

    // Check auto-win first
    const autoWin = this.checkAutoWin(combat)

    // Determine winner (Player >= Monster = Win)
    let playerWins = false
    if (combat.autoWin) {
      playerWins = true
    } else if (combat.autoLose) {
      playerWins = false
    } else {
      playerWins = combat.playerPower >= combat.monsterPower
    }

    combat.result = {
      playerWins,
      playerPower: combat.playerPower,
      monsterPower: combat.monsterPower,
      autoWin: combat.autoWin,
      modifiers: combat.modifiers
    }

    // Step 7: Apply result
    this.currentCombatFlow = COMBAT_FLOW.APPLY_RESULT
    combat.flowState = this.currentCombatFlow
    combat.phase = 'resolved'
    combat.canUseSkills = false
    combat.canPlayCards = false

    this.gameState.set('combat', { ...combat })

    return combat.result
  }

  /**
   * Apply combat rewards if player won
   * @param {Object} combat - Combat state
   * @param {Object} elementRewards - Element reward definitions
   * @returns {Object} Rewards given
   */
  applyRewards(combat, elementRewards) {
    if (!combat.result.playerWins) {
      return null
    }

    const player = combat.player
    const cave = combat.cave
    const monster = combat.monster

    const rewards = {
      victoryPoints: cave.victoryPoints,
      monster: monster,
      elementReward: null
    }

    // Victory points from cave
    player.addVictoryPoints(cave.victoryPoints)

    // Capture monster
    player.addMonster(monster)
    cave.removeMonster()

    // Element reward
    const elementReward = elementRewards[monster.element]
    if (elementReward) {
      rewards.elementReward = { ...elementReward }

      switch (elementReward.type) {
        case 'permanentPower':
          player.addPermanentPower(elementReward.value)
          break
        case 'treasureCard':
          const card = this.cardSystem.drawCard('treasure')
          if (card) {
            player.addTreasureCard(card)
          }
          break
        case 'chickenLeg':
          player.addChickenLegs(elementReward.value)
          break
        case 'victoryPoint':
          player.addVictoryPoints(elementReward.value)
          rewards.victoryPoints += elementReward.value
          break
      }
    }

    // Apply ally support reward (Cancer skill)
    if (combat.allySupport && combat.allySupport.player) {
      combat.allySupport.player.addVictoryPoints(2)
      rewards.allyReward = {
        player: combat.allySupport.player,
        victoryPoints: 2
      }
    }

    combat.rewards = rewards
    this.gameState.set('combat', { ...combat })

    return rewards
  }

  /**
   * Add a pending effect to combat
   * @param {Object} combat - Combat state
   * @param {Object} effect - Effect to add
   */
  addPendingEffect(combat, effect) {
    combat.pendingEffects.push(effect)
    this.gameState.set('combat', { ...combat })
  }

  /**
   * Add ally support (Cancer skill)
   * @param {Object} combat - Combat state
   * @param {Object} ally - Ally player
   * @param {number} diceRoll - Ally's dice roll
   */
  addAllySupport(combat, ally, diceRoll) {
    combat.allySupport = {
      player: ally,
      power: diceRoll,
      source: ally.character ? ally.character.skillName : 'Ally'
    }
    this.gameState.set('combat', { ...combat })
  }

  /**
   * Get current combat state
   * @returns {Object|null} Combat state
   */
  getCombat() {
    return this.gameState.get('combat')
  }

  /**
   * End combat and clean up (4.4.4 Step 8: END_COMBAT)
   */
  endCombat() {
    this.currentCombatFlow = COMBAT_FLOW.END
    this.gameState.set('combat', null)
    this.currentCombatFlow = null
  }

  /**
   * Check if currently in combat
   */
  isInCombat() {
    return this.gameState.get('combat') !== null
  }

  /**
   * Check if dice can be modified
   */
  canModifyDice() {
    const combat = this.gameState.get('combat')
    return combat && combat.canModifyDice
  }

  /**
   * Check if skills can be used in current combat state
   */
  canUseSkillsInCombat() {
    const combat = this.gameState.get('combat')
    return combat && combat.canUseSkills
  }

  /**
   * Check if cards can be played in current combat state
   */
  canPlayCardsInCombat() {
    const combat = this.gameState.get('combat')
    return combat && combat.canPlayCards
  }
}
