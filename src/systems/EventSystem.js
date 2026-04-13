/**
 * Event System
 * Handles event card effects
 */

import { roll } from '../utils/dice.js'

export class EventSystem {
  constructor(gameState, cardSystem) {
    this.gameState = gameState
    this.cardSystem = cardSystem
    this.eventHandlers = new Map()
    this._registerEventHandlers()
  }

  /**
   * Register all event handlers
   * @private
   */
  _registerEventHandlers() {
    this.eventHandlers.set('highest_dice_reward', this._handleHighestDiceReward.bind(this))
    this.eventHandlers.set('random_treasure_reward', this._handleRandomTreasureReward.bind(this))
    this.eventHandlers.set('dice_lottery', this._handleDiceLottery.bind(this))
    this.eventHandlers.set('lowest_score_dice_reward', this._handleLowestScoreDiceReward.bind(this))
    this.eventHandlers.set('monster_upgrade', this._handleMonsterUpgrade.bind(this))
    this.eventHandlers.set('odd_dice_skip_turn', this._handleOddDiceSkipTurn.bind(this))
    this.eventHandlers.set('lose_random_treasure', this._handleLoseRandomTreasure.bind(this))
    this.eventHandlers.set('richest_lose_chicken_legs', this._handleRichestLoseChickenLegs.bind(this))
    this.eventHandlers.set('pay_to_steal', this._handlePayToSteal.bind(this))
    this.eventHandlers.set('refund_on_success', this._handleRefundOnSuccess.bind(this))
    this.eventHandlers.set('bet_on_combat', this._handleBetOnCombat.bind(this))
    this.eventHandlers.set('shop', this._handleShop.bind(this))
    this.eventHandlers.set('pawn', this._handlePawn.bind(this))
    this.eventHandlers.set('refresh_all_skills', this._handleRefreshAllSkills.bind(this))
    this.eventHandlers.set('redistribute_chicken_legs', this._handleRedistributeChickenLegs.bind(this))
    this.eventHandlers.set('highest_dice_element_monster', this._handleHighestDiceElementMonster.bind(this))
    this.eventHandlers.set('bonus_monster', this._handleBonusMonster.bind(this))
    this.eventHandlers.set('coop_challenge', this._handleCoopChallenge.bind(this))
    this.eventHandlers.set('lowest_players_pvp', this._handleLowestPlayersPvp.bind(this))
  }

  /**
   * Execute an event
   * @param {Object} event - Event card
   * @param {Object} context - Event context (may include Leo skill redirect)
   * @returns {Object} Event result
   */
  executeEvent(event, context = {}) {
    const handler = this.eventHandlers.get(event.effect.type)
    if (!handler) {
      return { success: false, error: 'Unknown event type' }
    }

    // Check if event was blocked (Kính Mắt Thờ Ơ)
    if (context.eventBlocked) {
      return {
        success: true,
        blocked: true,
        message: 'Event was blocked'
      }
    }

    const result = handler(event, context)

    this.gameState.addToHistory({
      type: 'event_executed',
      event: event,
      result: result
    })

    return result
  }

  /**
   * Get all players sorted by victory points (ascending)
   * @private
   */
  _getPlayersByScore(ascending = true) {
    const players = [...this.gameState.get('players')]
    players.sort((a, b) => ascending ?
      a.victoryPoints - b.victoryPoints :
      b.victoryPoints - a.victoryPoints
    )
    return players
  }

  /**
   * Get players with most chicken legs
   * @private
   */
  _getRichestPlayers() {
    const players = this.gameState.get('players')
    const maxLegs = Math.max(...players.map(p => p.chickenLegs))
    return players.filter(p => p.chickenLegs === maxLegs)
  }

  /**
   * Roll dice for all players and get results
   * @private
   */
  _rollAllPlayers() {
    const players = this.gameState.get('players')
    const rolls = players.map(p => ({
      player: p,
      roll: roll()
    }))

    // Sort by roll (descending)
    rolls.sort((a, b) => b.roll - a.roll)
    return rolls
  }

  // Event Handlers

  _handleHighestDiceReward(event, context) {
    const rolls = this._rollAllPlayers()
    const winner = rolls[0]

    winner.player.addChickenLegs(event.effect.reward.chickenLegs)

    return {
      success: true,
      rolls: rolls.map(r => ({ playerIndex: r.player.index, roll: r.roll })),
      winner: winner.player.index,
      reward: event.effect.reward
    }
  }

  _handleRandomTreasureReward(event, context) {
    const rolls = this._rollAllPlayers()
    const winner = rolls[0]

    const card = this.cardSystem.drawCard('treasure')
    if (card) {
      winner.player.addTreasureCard(card)
    }

    return {
      success: true,
      rolls: rolls.map(r => ({ playerIndex: r.player.index, roll: r.roll })),
      winner: winner.player.index,
      card: card
    }
  }

  _handleDiceLottery(event, context) {
    const players = this.gameState.get('players')
    const results = []

    for (const player of players) {
      const diceResult = roll()
      const outcome = event.effect.outcomes[diceResult.toString()]

      let effect = null
      if (outcome.lose) {
        switch (outcome.lose) {
          case 'monster':
            if (player.capturedMonsters.length > 0) {
              const monster = player.removeMonster(0)
              this.cardSystem.discardCard('monster', monster)
              effect = { lost: 'monster', item: monster }
            }
            break
          case 'treasure':
            if (player.treasureCards.length > 0) {
              const card = player.removeTreasureCard(0)
              this.cardSystem.discardCard('treasure', card)
              effect = { lost: 'treasure', item: card }
            }
            break
          case 'chickenLeg':
            if (player.chickenLegs > 0) {
              player.removeChickenLegs(1)
              effect = { lost: 'chickenLeg', amount: 1 }
            }
            break
        }
      } else if (outcome.gain) {
        switch (outcome.gain) {
          case 'monster':
            const monster = this.cardSystem.drawCard('monster')
            if (monster) {
              player.addMonster(monster)
              effect = { gained: 'monster', item: monster }
            }
            break
          case 'treasure':
            const card = this.cardSystem.drawCard('treasure')
            if (card) {
              player.addTreasureCard(card)
              effect = { gained: 'treasure', item: card }
            }
            break
          case 'chickenLeg':
            player.addChickenLegs(1)
            effect = { gained: 'chickenLeg', amount: 1 }
            break
        }
      }

      results.push({
        playerIndex: player.index,
        diceResult,
        effect
      })
    }

    return { success: true, results }
  }

  _handleLowestScoreDiceReward(event, context) {
    const sortedPlayers = this._getPlayersByScore(true)
    const lowestPlayer = sortedPlayers[0]

    const diceResult = roll()
    lowestPlayer.addVictoryPoints(diceResult)

    return {
      success: true,
      playerIndex: lowestPlayer.index,
      diceResult,
      victoryPoints: diceResult
    }
  }

  _handleMonsterUpgrade(event, context) {
    // This requires player interaction - return pending state
    return {
      success: true,
      requiresInteraction: true,
      interactionType: 'monster_upgrade',
      message: 'Players may upgrade monsters'
    }
  }

  _handleOddDiceSkipTurn(event, context) {
    const players = this.gameState.get('players')
    const results = []

    for (const player of players) {
      const diceResult = roll()
      const isOdd = diceResult % 2 !== 0

      if (isOdd) {
        player.skipNextTurn = true
      }

      results.push({
        playerIndex: player.index,
        diceResult,
        skipTurn: isOdd
      })
    }

    return { success: true, results }
  }

  _handleLoseRandomTreasure(event, context) {
    const players = this.gameState.get('players')
    const results = []

    for (const player of players) {
      if (player.treasureCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * player.treasureCards.length)
        const card = player.removeTreasureCard(randomIndex)
        this.cardSystem.discardCard('treasure', card)
        results.push({ playerIndex: player.index, lostCard: card })
      }
    }

    return { success: true, results }
  }

  _handleRichestLoseChickenLegs(event, context) {
    const richestPlayers = this._getRichestPlayers()
    const results = []

    for (const player of richestPlayers) {
      const amount = Math.min(player.chickenLegs, event.effect.amount)
      player.removeChickenLegs(amount)
      results.push({ playerIndex: player.index, lost: amount })
    }

    return { success: true, results }
  }

  _handlePayToSteal(event, context) {
    // Requires player interaction
    return {
      success: true,
      requiresInteraction: true,
      interactionType: 'pay_to_steal',
      cost: event.effect.cost,
      message: 'Pay chicken legs to steal'
    }
  }

  _handleRefundOnSuccess(event, context) {
    // Set a flag for the turn - if player captures, refund cost
    context.refundOnCapture = true
    return {
      success: true,
      activeThisTurn: true,
      message: 'Cave cost refunded on successful capture'
    }
  }

  _handleBetOnCombat(event, context) {
    // Requires interaction - players bet on combat outcomes
    return {
      success: true,
      requiresInteraction: true,
      interactionType: 'bet_on_combat',
      reward: event.effect.reward,
      message: 'Bet on combat outcomes'
    }
  }

  _handleShop(event, context) {
    return {
      success: true,
      requiresInteraction: true,
      interactionType: 'shop',
      cost: event.effect.cost,
      reward: event.effect.reward,
      message: 'Secret shop available'
    }
  }

  _handlePawn(event, context) {
    return {
      success: true,
      requiresInteraction: true,
      interactionType: 'pawn',
      cost: event.effect.cost,
      reward: event.effect.reward,
      message: 'Pawn shop available'
    }
  }

  _handleRefreshAllSkills(event, context) {
    const players = this.gameState.get('players')

    for (const player of players) {
      player.refreshSkill()
    }

    return {
      success: true,
      message: 'All skills refreshed'
    }
  }

  _handleRedistributeChickenLegs(event, context) {
    const players = this.gameState.get('players')
    const totalLegs = players.reduce((sum, p) => sum + p.chickenLegs, 0)
    const perPlayer = Math.floor(totalLegs / players.length)
    const remainder = totalLegs % players.length

    // Set each player to equal amount
    for (let i = 0; i < players.length; i++) {
      players[i].chickenLegs = perPlayer + (i < remainder ? 1 : 0)
    }

    this.gameState.set('players', [...players])

    return {
      success: true,
      totalLegs,
      perPlayer,
      message: `${totalLegs} chicken legs redistributed (${perPlayer} each)`
    }
  }

  _handleHighestDiceElementMonster(event, context) {
    const element = event.effect.element
    const rolls = this._rollAllPlayers()
    const winner = rolls[0]

    // Try to draw a monster of that element
    const monsterDeck = this.gameState.get('monsterDeck')
    const monsterIndex = monsterDeck.findIndex(m => m.element === element)

    let monster = null
    if (monsterIndex !== -1) {
      monster = monsterDeck.splice(monsterIndex, 1)[0]
      this.gameState.set('monsterDeck', monsterDeck)
      winner.player.addMonster(monster)
    }

    return {
      success: true,
      rolls: rolls.map(r => ({ playerIndex: r.player.index, roll: r.roll })),
      winner: winner.player.index,
      monster: monster,
      element: element
    }
  }

  _handleBonusMonster(event, context) {
    const players = this.gameState.get('players')
    const results = []

    // Each player gets a monster based on dice roll
    for (const player of players) {
      const diceResult = roll()

      // Higher roll = better chance
      if (diceResult >= 4) {
        const monster = this.cardSystem.drawCard('monster')
        if (monster) {
          player.addMonster(monster)
          results.push({ playerIndex: player.index, diceResult, monster })
        }
      } else {
        results.push({ playerIndex: player.index, diceResult, monster: null })
      }
    }

    return { success: true, results }
  }

  _handleCoopChallenge(event, context) {
    // Cooperative challenge - all players roll, if total >= threshold, all get reward
    const players = this.gameState.get('players')
    const rolls = []
    let total = 0

    for (const player of players) {
      const diceResult = roll()
      rolls.push({ playerIndex: player.index, roll: diceResult })
      total += diceResult
    }

    const threshold = players.length * 3 // Average of 3 per player
    const success = total >= threshold

    if (success) {
      for (const player of players) {
        player.addVictoryPoints(1)
      }
    }

    return {
      success: true,
      rolls,
      total,
      threshold,
      challengeSuccess: success,
      message: success ? 'Challenge succeeded! +1 VP each' : 'Challenge failed'
    }
  }

  _handleLowestPlayersPvp(event, context) {
    const sortedPlayers = this._getPlayersByScore(true)

    // Get all players tied for lowest score
    const lowestScore = sortedPlayers[0].victoryPoints
    const lowestPlayers = sortedPlayers.filter(p => p.victoryPoints === lowestScore)

    if (lowestPlayers.length < 2) {
      return {
        success: true,
        noPvp: true,
        message: 'Not enough players tied for lowest'
      }
    }

    // PVP between lowest players
    const pvpResults = []
    for (let i = 0; i < lowestPlayers.length; i++) {
      pvpResults.push({
        playerIndex: lowestPlayers[i].index,
        roll: roll()
      })
    }

    // Highest roller among lowest players wins 2 VP
    pvpResults.sort((a, b) => b.roll - a.roll)
    const winner = lowestPlayers.find(p => p.index === pvpResults[0].playerIndex)
    winner.addVictoryPoints(2)

    return {
      success: true,
      pvpResults,
      winner: winner.index,
      reward: 2
    }
  }
}
