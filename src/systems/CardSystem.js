/**
 * Card System
 * Manages card decks, drawing, playing, and effect execution
 */

import { shuffle, shuffleCopy } from '../utils/shuffle.js'
import { roll } from '../utils/dice.js'

export class CardSystem {
  constructor(gameState) {
    this.gameState = gameState
    this.effectHandlers = new Map()
    this._registerEffectHandlers()
  }

  /**
   * Register all effect handlers
   * @private
   */
  _registerEffectHandlers() {
    // Dice modification effects
    this.effectHandlers.set('set_dice', this._handleSetDice.bind(this))
    this.effectHandlers.set('block_treasure', this._handleBlockTreasure.bind(this))
    this.effectHandlers.set('gain_on_opponent_gain', this._handleGainOnOpponentGain.bind(this))
    this.effectHandlers.set('swap_monster', this._handleSwapMonster.bind(this))
    this.effectHandlers.set('steal_monster', this._handleStealMonster.bind(this))
    this.effectHandlers.set('free_cave_entry', this._handleFreeCaveEntry.bind(this))
    this.effectHandlers.set('steal_treasure', this._handleStealTreasure.bind(this))
    this.effectHandlers.set('borrow_fire_power', this._handleBorrowFirePower.bind(this))
    this.effectHandlers.set('force_ally_combat', this._handleForceAllyCombat.bind(this))
    this.effectHandlers.set('swap_cave_monster', this._handleSwapCaveMonster.bind(this))
    this.effectHandlers.set('block_action', this._handleBlockAction.bind(this))
    this.effectHandlers.set('trigger_on_opponent_monster', this._handleTriggerOnOpponentMonster.bind(this))
    this.effectHandlers.set('block_event', this._handleBlockEvent.bind(this))
    this.effectHandlers.set('refresh_skill', this._handleRefreshSkill.bind(this))
    this.effectHandlers.set('destroy_monster', this._handleDestroyMonster.bind(this))
    this.effectHandlers.set('ally_dice_bonus', this._handleAllyDiceBonus.bind(this))
    this.effectHandlers.set('auto_win_on_dice', this._handleAutoWinOnDice.bind(this))
  }

  /**
   * Draw a card from a deck
   * @param {string} deckType - 'treasure', 'monster', or 'event'
   * @returns {Object|null} Drawn card or null if deck empty
   */
  drawCard(deckType) {
    const deckKey = `${deckType}Deck`
    const discardKey = `${deckType}Discard`

    let deck = this.gameState.get(deckKey)

    // If deck empty, reshuffle discard pile
    if (deck.length === 0) {
      const discard = this.gameState.get(discardKey)
      if (discard.length > 0) {
        deck = shuffleCopy(discard)
        this.gameState.set(deckKey, deck)
        this.gameState.set(discardKey, [])
      } else {
        return null
      }
    }

    const card = deck.pop()
    this.gameState.set(deckKey, deck)
    return card
  }

  /**
   * Discard a card
   * @param {string} deckType - 'treasure', 'monster', or 'event'
   * @param {Object} card - Card to discard
   */
  discardCard(deckType, card) {
    const discardKey = `${deckType}Discard`
    const discard = this.gameState.get(discardKey)
    discard.push(card)
    this.gameState.set(discardKey, discard)
  }

  /**
   * Play a treasure card
   * @param {Object} player - Player playing the card
   * @param {number} cardIndex - Index of card in player's hand
   * @param {Object} context - Context for the effect (target, combat, etc.)
   * @returns {Object} Result of playing the card
   */
  playTreasureCard(player, cardIndex, context = {}) {
    if (cardIndex < 0 || cardIndex >= player.treasureCards.length) {
      return { success: false, error: 'Invalid card index' }
    }

    const card = player.treasureCards[cardIndex]

    // Check timing restrictions
    if (card.type === 'action' && !context.isPlayerTurn) {
      return { success: false, error: 'Action cards can only be played during your turn' }
    }

    // Remove card from hand
    player.removeTreasureCard(cardIndex)

    // Execute effect
    const result = this.executeEffect(card.effect, player, context)

    // Discard the card
    this.discardCard('treasure', card)

    // Record in history
    this.gameState.addToHistory({
      type: 'play_treasure',
      playerIndex: player.index,
      card: card,
      result: result
    })

    return { success: true, card, result }
  }

  /**
   * Execute a card effect
   * @param {Object} effect - Effect definition
   * @param {Object} player - Player executing the effect
   * @param {Object} context - Additional context
   * @returns {Object} Effect result
   */
  executeEffect(effect, player, context = {}) {
    const handler = this.effectHandlers.get(effect.type)
    if (handler) {
      return handler(effect, player, context)
    }
    return { success: false, error: 'Unknown effect type' }
  }

  /**
   * Check if a card can be played
   * @param {Object} card - Card to check
   * @param {Object} context - Current game context
   * @returns {boolean} True if card can be played
   */
  canPlayCard(card, context) {
    if (card.type === 'action' && !context.isPlayerTurn) {
      return false
    }

    // Check trigger conditions
    const effect = card.effect
    switch (effect.trigger) {
      case 'on_dice_roll':
        return context.hasDiceRoll === true
      case 'on_combat':
        return context.inCombat === true
      case 'on_opponent_treasure':
        return context.opponentPlayedTreasure === true
      case 'on_opponent_gain_points':
        return context.opponentGainedPoints === true
      case 'on_event':
        return context.eventDrawn === true
      default:
        return true
    }
  }

  // Effect Handlers

  _handleSetDice(effect, player, context) {
    if (context.diceResult !== undefined) {
      context.modifiedDiceResult = effect.value
      return { success: true, newValue: effect.value }
    }
    return { success: false, error: 'No dice to modify' }
  }

  _handleBlockTreasure(effect, player, context) {
    if (context.targetCard) {
      context.cardBlocked = true
      return { success: true, blockedCard: context.targetCard }
    }
    return { success: false, error: 'No card to block' }
  }

  _handleGainOnOpponentGain(effect, player, context) {
    player.addVictoryPoints(effect.reward.victoryPoints)
    return { success: true, gained: effect.reward.victoryPoints }
  }

  _handleSwapMonster(effect, player, context) {
    if (!context.targetPlayer || !context.playerMonsterIndex || !context.targetMonsterIndex) {
      return { success: false, error: 'Must specify target player and monsters' }
    }

    const targetPlayer = context.targetPlayer
    const playerMonster = player.capturedMonsters[context.playerMonsterIndex]
    const targetMonster = targetPlayer.capturedMonsters[context.targetMonsterIndex]

    if (!playerMonster || !targetMonster) {
      return { success: false, error: 'Invalid monster selection' }
    }

    // Swap
    player.capturedMonsters[context.playerMonsterIndex] = targetMonster
    targetPlayer.capturedMonsters[context.targetMonsterIndex] = playerMonster

    return { success: true, swapped: { gave: playerMonster, received: targetMonster } }
  }

  _handleStealMonster(effect, player, context) {
    if (!context.targetPlayer || context.targetMonsterIndex === undefined) {
      return { success: false, error: 'Must specify target' }
    }

    const targetPlayer = context.targetPlayer
    const monster = targetPlayer.removeMonster(context.targetMonsterIndex)

    if (!monster) {
      return { success: false, error: 'No monster to steal' }
    }

    player.addMonster(monster)
    return { success: true, stolen: monster }
  }

  _handleFreeCaveEntry(effect, player, context) {
    context.freeCaveEntry = true
    return { success: true }
  }

  _handleStealTreasure(effect, player, context) {
    if (!context.targetPlayer) {
      return { success: false, error: 'Must specify target' }
    }

    const targetPlayer = context.targetPlayer
    if (targetPlayer.treasureCards.length === 0) {
      return { success: false, error: 'Target has no treasure cards' }
    }

    // Steal random card
    const randomIndex = Math.floor(Math.random() * targetPlayer.treasureCards.length)
    const card = targetPlayer.removeTreasureCard(randomIndex)
    player.addTreasureCard(card)

    return { success: true, stolen: card }
  }

  _handleBorrowFirePower(effect, player, context) {
    // Count fire monsters from opponents
    const players = this.gameState.get('players')
    let firePower = 0

    for (const p of players) {
      if (p.index !== player.index) {
        firePower += p.capturedMonsters.filter(m => m.element === 'fire').length
      }
    }

    context.combatBonus = (context.combatBonus || 0) + firePower
    return { success: true, bonusPower: firePower }
  }

  _handleForceAllyCombat(effect, player, context) {
    if (!context.targetPlayer) {
      return { success: false, error: 'Must specify ally' }
    }
    context.forcedAlly = context.targetPlayer
    return { success: true }
  }

  _handleSwapCaveMonster(effect, player, context) {
    if (context.playerMonsterIndex === undefined || !context.targetCave) {
      return { success: false, error: 'Must specify monster and cave' }
    }

    const playerMonster = player.capturedMonsters[context.playerMonsterIndex]
    const caveMonster = context.targetCave.monster

    if (!playerMonster || !caveMonster) {
      return { success: false, error: 'Invalid swap' }
    }

    player.capturedMonsters[context.playerMonsterIndex] = caveMonster
    context.targetCave.setMonster(playerMonster)

    return { success: true, swapped: { gave: playerMonster, received: caveMonster } }
  }

  _handleBlockAction(effect, player, context) {
    if (!context.targetPlayer) {
      return { success: false, error: 'Must specify target' }
    }
    context.targetPlayer.skipNextTurn = true
    return { success: true }
  }

  _handleTriggerOnOpponentMonster(effect, player, context) {
    // This is a reactive effect, handled during monster capture
    return { success: true, reactive: true }
  }

  _handleBlockEvent(effect, player, context) {
    context.eventBlocked = true
    return { success: true }
  }

  _handleRefreshSkill(effect, player, context) {
    player.refreshSkill()
    return { success: true }
  }

  _handleDestroyMonster(effect, player, context) {
    if (!context.targetPlayer || context.targetMonsterIndex === undefined) {
      return { success: false, error: 'Must specify target' }
    }

    const targetPlayer = context.targetPlayer
    const monster = targetPlayer.removeMonster(context.targetMonsterIndex)

    if (!monster) {
      return { success: false, error: 'No monster to destroy' }
    }

    // Discard the monster
    this.discardCard('monster', monster)
    return { success: true, destroyed: monster }
  }

  _handleAllyDiceBonus(effect, player, context) {
    if (!context.targetPlayer || !context.inCombat) {
      return { success: false, error: 'Must be used during ally combat' }
    }

    const bonusDice = roll()
    context.allyCombatBonus = (context.allyCombatBonus || 0) + bonusDice
    return { success: true, bonusDice }
  }

  _handleAutoWinOnDice(effect, player, context) {
    if (!context.diceResult) {
      return { success: false, error: 'No dice result' }
    }

    if (effect.values.includes(context.diceResult)) {
      context.autoWin = true
      return { success: true, autoWin: true }
    }
    return { success: true, autoWin: false }
  }
}
