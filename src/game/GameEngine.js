/**
 * Game Engine
 * Main coordinator for all game systems
 * Implements gameplay flow as documented in game.md section 4.4
 */

import { GameState, PHASES, ACTIONS } from './GameState.js'
import { TurnManager } from './TurnManager.js'
import { PhaseManager } from './PhaseManager.js'
import { GameFlowController, GAME_STATES, TURN_STATES, COMBAT_STATES } from './GameFlowController.js'
import { Player } from '../entities/Player.js'
import { Cave, createGameCaves } from '../entities/Cave.js'
import { shuffle, shuffleCopy } from '../utils/shuffle.js'
import { roll, isEven, flip } from '../utils/dice.js'

// Import systems
import { CardSystem } from '../systems/CardSystem.js'
import { CombatSystem } from '../systems/CombatSystem.js'
import { SkillSystem } from '../systems/SkillSystem.js'
import { EventSystem } from '../systems/EventSystem.js'
import { AISystem } from '../systems/AISystem.js'

// Import game data
import charactersData from '../data/characters.json'
import monstersData from '../data/monsters.json'
import treasuresData from '../data/treasures.json'
import eventsData from '../data/events.json'
import ancientBeastsData from '../data/ancientBeasts.json'

export class GameEngine {
  constructor(config = {}) {
    this.config = {
      maxPlayers: config.maxPlayers || 6,
      minPlayers: config.minPlayers || 2,
      maxRounds: config.maxRounds || 8,
      startingChickenLegs: config.startingChickenLegs || 3,
      startingTreasureCards: config.startingTreasureCards || 3,
    }

    // Initialize core systems
    this.gameState = new GameState()
    this.turnManager = new TurnManager(this.gameState)
    this.phaseManager = new PhaseManager(this.gameState, this.turnManager)
    this.flowController = new GameFlowController(this.gameState)

    // Initialize subsystems
    this.cardSystem = new CardSystem(this.gameState)
    this.combatSystem = new CombatSystem(this.gameState, this.cardSystem)
    this.skillSystem = new SkillSystem(this.gameState, this.cardSystem)
    this.eventSystem = new EventSystem(this.gameState, this.cardSystem)
    this.aiSystem = new AISystem(this.gameState)

    // Connect flow controller events
    this._setupFlowControllerEvents()

    // Game data
    this.characters = charactersData.characters
    this.monstersData = monstersData
    this.treasuresData = treasuresData
    this.eventsData = eventsData
    this.ancientBeastsData = ancientBeastsData

    // Event callbacks for UI
    this.callbacks = {
      onStateChange: null,
      onPhaseChange: null,
      onTurnChange: null,
      onCombat: null,
      onEvent: null,
      onGameOver: null,
      onAIAction: null,
      onSkillUsed: null,
      onCardPlayed: null,
    }

    // Context for card effects
    this.context = {
      isPlayerTurn: false,
      inCombat: false,
      hasDiceRoll: false,
      eventPhase: false,
      lastPlayedTreasure: null,
      refundOnCapture: false,
    }

    // Subscribe to state changes
    this.gameState.subscribe('*', (newValue, oldValue, key) => {
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(key, newValue, oldValue)
      }
    })
  }

  /**
   * Register callback for game events
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback
    }
  }

  /**
   * Setup flow controller event handlers
   * @private
   */
  _setupFlowControllerEvents() {
    this.flowController.on('onGameStateChange', (newState, oldState) => {
      this.gameState.addToHistory({
        type: 'flow_state_change',
        from: oldState,
        to: newState
      })
    })

    this.flowController.on('onTurnStateChange', (turnState) => {
      this.context.isPlayerTurn = turnState === TURN_STATES.CHOOSE_ACTION
    })

    this.flowController.on('onCombatStateChange', (combatState) => {
      this.context.inCombat = combatState !== null
    })

    this.flowController.on('onTimingWindowOpen', (window) => {
      // Update context based on timing window
      if (window.type === 'event_phase') {
        this.context.eventPhase = true
      }
    })

    this.flowController.on('onTimingWindowClose', (window) => {
      if (window.type === 'event_phase') {
        this.context.eventPhase = false
      }
    })
  }

  /**
   * Get flow controller for external access
   */
  getFlowController() {
    return this.flowController
  }

  /**
   * Get available actions for current player (using flow controller)
   */
  getAvailableActionsForCurrentPlayer() {
    const player = this.turnManager.getCurrentPlayer()
    if (!player) return []
    return this.flowController.getAvailableActions(player)
  }

  /**
   * Calculate win probability for a cave
   */
  getWinProbability(caveIndex) {
    const player = this.turnManager.getCurrentPlayer()
    const caves = this.gameState.get('caves')
    const cave = caves[caveIndex]

    if (!cave || !cave.monster || !player) {
      return null
    }

    return this.flowController.calculateWinProbability(player, cave.monster)
  }

  /**
   * Get available characters for selection
   */
  getAvailableCharacters() {
    return [...this.characters]
  }

  /**
   * Initialize a new game
   */
  initializeGame(playerConfigs) {
    if (
      playerConfigs.length < this.config.minPlayers ||
      playerConfigs.length > this.config.maxPlayers
    ) {
      throw new Error(
        `Player count must be between ${this.config.minPlayers} and ${this.config.maxPlayers}`
      )
    }

    this.gameState.reset()

    const players = playerConfigs.map((config, index) => {
      const player = new Player(index, config.name, config.isAI)
      const character = this.characters.find((c) => c.id === config.characterId)
      if (character) {
        player.setCharacter(character)
      }
      return player
    })

    const monsterDeck = this._createMonsterDeck()
    const treasureDeck = this._createTreasureDeck()
    const eventDeck = this._createEventDeck()

    shuffle(monsterDeck)
    shuffle(treasureDeck)
    shuffle(eventDeck)

    const { smallCaves, ancientCaves } = createGameCaves(
      this.ancientBeastsData.ancientBeasts
    )

    for (const cave of smallCaves) {
      if (monsterDeck.length > 0) {
        cave.setMonster(monsterDeck.pop())
      }
    }

    for (const player of players) {
      player.chickenLegs = this.config.startingChickenLegs
      for (let i = 0; i < this.config.startingTreasureCards; i++) {
        if (treasureDeck.length > 0) {
          player.addTreasureCard(treasureDeck.pop())
        }
      }
    }

    let highestRoll = 0
    let firstPlayerIndex = 0
    for (let i = 0; i < players.length; i++) {
      const diceRoll = roll()
      if (diceRoll > highestRoll) {
        highestRoll = diceRoll
        firstPlayerIndex = i
      }
    }

    this.gameState.update({
      players,
      caves: smallCaves,
      ancientBeastCaves: ancientCaves,
      monsterDeck,
      monsterDiscard: [],
      treasureDeck,
      treasureDiscard: [],
      eventDeck,
      eventDiscard: [],
      ancientBeasts: [...this.ancientBeastsData.ancientBeasts],
      firstPlayerIndex,
      currentPlayerIndex: firstPlayerIndex,
      currentDay: 1,
      maxDays: this.config.maxRounds,
      currentPhase: PHASES.DAILY_REWARD,
      isGameOver: false,
    })

    this.gameState.addToHistory({
      type: 'game_start',
      playerCount: players.length,
      firstPlayer: firstPlayerIndex,
    })

    // Set flow controller state
    this.flowController.setGameState(GAME_STATES.GAME_INIT)

    return true
  }

  _createMonsterDeck() {
    return this.monstersData.monsters.map((m) => ({ ...m }))
  }

  _createTreasureDeck() {
    const deck = []
    for (const treasure of this.treasuresData.treasures) {
      for (let i = 0; i < treasure.quantity; i++) {
        deck.push({ ...treasure, instanceId: `${treasure.id}_${i}` })
      }
    }
    return deck
  }

  _createEventDeck() {
    return this.eventsData.events.map((e) => ({ ...e }))
  }

  startGame() {
    // Transition to playing state
    this.flowController.setGameState(GAME_STATES.PLAYING)
    this.phaseManager.startDay()
    this._executePhase()
  }

  async _executePhase() {
    const phase = this.gameState.get('currentPhase')

    this.context.eventPhase = phase === PHASES.EVENT

    switch (phase) {
      case PHASES.DAILY_REWARD:
        this._executeDailyRewardPhase()
        break
      case PHASES.EVENT:
        this._executeEventPhase()
        break
      case PHASES.PLAYER_TURNS:
        this._startPlayerTurnsPhase()
        break
      case PHASES.DAY_END:
        this._executeDayEndPhase()
        break
    }

    if (this.callbacks.onPhaseChange) {
      this.callbacks.onPhaseChange(phase)
    }
  }

  _executeDailyRewardPhase() {
    const currentDay = this.gameState.get('currentDay')

    if (currentDay > 1) {
      const players = this.gameState.get('players')
      const treasureDeck = this.gameState.get('treasureDeck')

      for (const player of players) {
        player.addChickenLegs(1)

        if (treasureDeck.length > 0) {
          player.addTreasureCard(treasureDeck.pop())
        }

        for (const beast of player.ancientBeasts) {
          this._applyAncientBeastDailyBonus(player, beast)
        }
      }

      this.gameState.set('players', [...players])
      this.gameState.set('treasureDeck', treasureDeck)
    }

    this.advancePhase()
  }

  _applyAncientBeastDailyBonus(player, beast) {
    const bonus = beast.dailyBonus
    switch (bonus.type) {
      case 'combatPower':
        break
      case 'treasureCard':
        const treasureDeck = this.gameState.get('treasureDeck')
        if (treasureDeck.length > 0) {
          player.addTreasureCard(treasureDeck.pop())
          this.gameState.set('treasureDeck', treasureDeck)
        }
        break
      case 'chickenLeg':
        player.addChickenLegs(bonus.value)
        break
      case 'victoryPoint':
        player.addVictoryPoints(bonus.value)
        break
    }
  }

  _executeEventPhase() {
    const eventDeck = this.gameState.get('eventDeck')
    const eventDiscard = this.gameState.get('eventDiscard')

    if (eventDeck.length === 0 && eventDiscard.length > 0) {
      const reshuffled = shuffleCopy(eventDiscard)
      this.gameState.set('eventDeck', reshuffled)
      this.gameState.set('eventDiscard', [])
    }

    const updatedDeck = this.gameState.get('eventDeck')
    if (updatedDeck.length > 0) {
      const event = updatedDeck.pop()
      this.gameState.set('eventDeck', updatedDeck)
      this.gameState.set('currentEvent', event)

      if (this.callbacks.onEvent) {
        this.callbacks.onEvent(event)
      }

      this.gameState.addToHistory({
        type: 'event_drawn',
        event: event,
      })
    } else {
      this.advancePhase()
    }
  }

  /**
   * Execute event effect and complete phase
   */
  executeEventEffect(context = {}) {
    const event = this.gameState.get('currentEvent')
    if (!event) return null

    const result = this.eventSystem.executeEvent(event, context)

    this.gameState.addToHistory({
      type: 'event_effect',
      event: event,
      result: result,
    })

    return result
  }

  completeEventPhase() {
    const event = this.gameState.get('currentEvent')
    if (event) {
      const eventDiscard = this.gameState.get('eventDiscard')
      eventDiscard.push(event)
      this.gameState.set('eventDiscard', eventDiscard)
      // Keep currentEvent set so the day's event remains visible until the next draw
    }
    this.context.refundOnCapture = false
    this.advancePhase()
  }

  _startPlayerTurnsPhase() {
    this.turnManager.startTurns()

    const currentPlayer = this.turnManager.getCurrentPlayer()
    currentPlayer.startTurn()
    this.context.isPlayerTurn = true

    if (this.callbacks.onTurnChange) {
      this.callbacks.onTurnChange(currentPlayer)
    }

    // Handle AI turn
    if (currentPlayer.isAI) {
      this._handleAITurn(currentPlayer)
    }
  }

  /**
   * Handle AI player's turn
   */
  async _handleAITurn(player) {
    await this._delay(this.aiSystem.getThinkingDelay())

    const decision = this.aiSystem.decideTurn(player)

    if (this.callbacks.onAIAction) {
      this.callbacks.onAIAction(player, decision)
    }

    switch (decision.action) {
      case 'enter_cave':
        this.enterCave(decision.params.caveIndex)
        break
      case 'capture_beast':
        this.captureAncientBeast(
          decision.params.beastIndex,
          decision.params.monsterIndices
        )
        this.endTurn()
        break
      case 'use_skill':
        this.useSkill(decision.params)
        break
      case 'pass':
      default:
        this.passTurn()
        break
    }
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  _executeDayEndPhase() {
    const isGameOver = this.phaseManager.endDay()

    if (isGameOver) {
      this._endGame()
    } else {
      this.phaseManager.startDay()
      this._executePhase()
    }
  }

  advancePhase() {
    const dayComplete = this.phaseManager.nextPhase()
    this._executePhase()
  }

  /**
   * Enter a cave
   */
  enterCave(caveIndex, freeCaveEntry = false) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const caves = this.gameState.get('caves')
    const cave = caves[caveIndex]

    if (!cave || !cave.hasMonster()) {
      return { success: false, error: 'Invalid cave or no monster' }
    }

    const cost = freeCaveEntry ? 0 : cave.cost
    if (!currentPlayer.canAfford(cost)) {
      return { success: false, error: 'Not enough chicken legs' }
    }

    // Store cost for potential refund
    this.context.caveCost = cost
    currentPlayer.removeChickenLegs(cost)

    // Start combat using combat system
    const combat = this.combatSystem.startCombat(currentPlayer, cave)
    this.context.inCombat = true

    if (this.callbacks.onCombat) {
      this.callbacks.onCombat(combat)
    }

    return { success: true, combat }
  }

  /**
   * Roll player dice in combat
   */
  rollPlayerDice() {
    const combat = this.gameState.get('combat')
    if (!combat) return null

    const result = this.combatSystem.rollPlayerDice(combat)
    this.context.hasDiceRoll = true
    this.context.diceResult = result

    return result
  }

  /**
   * Roll monster dice in combat
   */
  rollMonsterDice() {
    const combat = this.gameState.get('combat')
    if (!combat) return null

    return this.combatSystem.rollMonsterDice(combat)
  }

  /**
   * Modify player dice (from card or skill)
   */
  modifyPlayerDice(newValue, source) {
    const combat = this.gameState.get('combat')
    if (!combat) return

    this.combatSystem.modifyPlayerDice(combat, newValue, source)
    this.context.diceResult = newValue
  }

  /**
   * Flip player dice (Aquarius skill)
   */
  flipPlayerDice() {
    const combat = this.gameState.get('combat')
    if (!combat) return

    this.combatSystem.flipPlayerDice(combat)
    this.context.diceResult = combat.playerDiceModified
  }

  /**
   * Resolve combat
   */
  resolveCombat() {
    const combat = this.gameState.get('combat')
    if (!combat || combat.playerDice === null || combat.monsterDice === null) {
      return null
    }

    const result = this.combatSystem.resolveCombat(combat)

    if (result.playerWins) {
      const rewards = this.combatSystem.applyRewards(
        combat,
        this.monstersData.elementRewards
      )
      result.rewards = rewards

      // Refill cave
      this._refillCave(combat.cave)

      // Check for refund event effect
      if (this.context.refundOnCapture && this.context.caveCost) {
        combat.player.addChickenLegs(this.context.caveCost)
        result.refunded = this.context.caveCost
      }
    }

    this.context.inCombat = false
    this.context.hasDiceRoll = false

    this.gameState.set('players', [...this.gameState.get('players')])
    this.gameState.set('caves', [...this.gameState.get('caves')])

    this.gameState.addToHistory({
      type: 'combat',
      playerIndex: combat.player.index,
      caveId: combat.cave.id,
      result,
    })

    return result
  }

  /**
   * End combat and cleanup
   */
  endCombat() {
    this.combatSystem.endCombat()
    this.context.inCombat = false
  }

  _refillCave(cave) {
    const monsterDeck = this.gameState.get('monsterDeck')
    if (monsterDeck.length > 0) {
      cave.setMonster(monsterDeck.pop())
      this.gameState.set('monsterDeck', monsterDeck)
    }
  }

  /**
   * Use character skill
   */
  useSkill(params = {}) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const context = {
      ...this.context,
      ...params,
      combat: this.gameState.get('combat'),
    }

    const result = this.skillSystem.useSkill(currentPlayer, context)

    if (result.success) {
      this.gameState.set('players', [...this.gameState.get('players')])

      if (this.callbacks.onSkillUsed) {
        this.callbacks.onSkillUsed(currentPlayer, result)
      }
    }

    return result
  }

  /**
   * Check if skill can be used
   */
  canUseSkill(player = null) {
    const p = player || this.turnManager.getCurrentPlayer()
    return this.skillSystem.canUseSkill(p, this.context)
  }

  /**
   * Get skill info for UI
   */
  getSkillInfo(player = null) {
    const p = player || this.turnManager.getCurrentPlayer()
    return this.skillSystem.getSkillInfo(p)
  }

  /**
   * Play a treasure card
   */
  playTreasureCard(cardIndex, targetContext = {}) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const context = {
      ...this.context,
      ...targetContext,
      combat: this.gameState.get('combat'),
    }

    const result = this.cardSystem.playTreasureCard(currentPlayer, cardIndex, context)

    if (result.success) {
      this.context.lastPlayedTreasure = result.card
      this.gameState.set('players', [...this.gameState.get('players')])

      if (this.callbacks.onCardPlayed) {
        this.callbacks.onCardPlayed(currentPlayer, result)
      }
    }

    return result
  }

  /**
   * Check if a card can be played
   */
  canPlayCard(card) {
    return this.cardSystem.canPlayCard(card, this.context)
  }

  /**
   * Capture ancient beast
   */
  captureAncientBeast(beastIndex, monsterIndices) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const ancientBeasts = this.gameState.get('ancientBeasts')
    const beast = ancientBeasts[beastIndex]

    if (!beast) {
      return { success: false, error: 'Invalid ancient beast' }
    }

    if (!currentPlayer.canCaptureAncientBeast(beast)) {
      return { success: false, error: 'Requirements not met' }
    }

    const monstersToRemove = monsterIndices
      .sort((a, b) => b - a)
      .map((i) => currentPlayer.removeMonster(i))

    currentPlayer.addAncientBeast(beast)
    currentPlayer.addVictoryPoints(beast.victoryPoints)

    this._applyImmediateReward(currentPlayer, beast.immediateReward)

    ancientBeasts.splice(beastIndex, 1)

    this.gameState.set('ancientBeasts', ancientBeasts)
    this.gameState.set('players', [...this.gameState.get('players')])

    this.gameState.addToHistory({
      type: 'capture_ancient_beast',
      playerIndex: currentPlayer.index,
      beastId: beast.id,
      monstersUsed: monstersToRemove,
    })

    return { success: true, beast }
  }

  _applyImmediateReward(player, reward) {
    switch (reward.type) {
      case 'permanentPower':
        player.addPermanentPower(reward.value)
        break
      case 'treasureCards':
        const treasureDeck = this.gameState.get('treasureDeck')
        for (let i = 0; i < reward.value && treasureDeck.length > 0; i++) {
          player.addTreasureCard(treasureDeck.pop())
        }
        this.gameState.set('treasureDeck', treasureDeck)
        break
      case 'chickenLegs':
        player.addChickenLegs(reward.value)
        break
      case 'victoryPoints':
        player.addVictoryPoints(reward.value)
        break
    }
  }

  /**
   * Check if player can capture a beast
   */
  canCaptureAncientBeast(beastIndex) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const ancientBeasts = this.gameState.get('ancientBeasts')
    const beast = ancientBeasts[beastIndex]

    if (!beast) return false
    return currentPlayer.canCaptureAncientBeast(beast)
  }

  /**
   * Get capture requirements for UI
   */
  getCaptureRequirements(beastIndex) {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    const ancientBeasts = this.gameState.get('ancientBeasts')
    const beast = ancientBeasts[beastIndex]

    if (!beast) return null

    const req = beast.requirement
    return {
      beast: beast,
      requiredElement: req.requiredElement,
      sameElementNeeded: req.sameElement,
      anyElementNeeded: req.anyElement,
      playerSameElement: currentPlayer.countMonstersByElement(req.requiredElement),
      playerTotalMonsters: currentPlayer.capturedMonsters.length,
      canCapture: currentPlayer.canCaptureAncientBeast(beast),
    }
  }

  passTurn() {
    const currentPlayer = this.turnManager.getCurrentPlayer()
    currentPlayer.endTurn()
    this.context.isPlayerTurn = false

    this.gameState.addToHistory({
      type: 'pass',
      playerIndex: currentPlayer.index,
    })

    return this.endTurn()
  }

  endTurn() {
    this.context.isPlayerTurn = false
    this.context.lastPlayedTreasure = null

    const allDone = this.turnManager.endTurn()

    if (allDone) {
      this.advancePhase()
      return { allTurnsComplete: true }
    } else {
      const nextPlayer = this.turnManager.getCurrentPlayer()
      nextPlayer.startTurn()
      this.context.isPlayerTurn = true

      if (this.callbacks.onTurnChange) {
        this.callbacks.onTurnChange(nextPlayer)
      }

      if (nextPlayer.isAI) {
        this._handleAITurn(nextPlayer)
      }

      return { allTurnsComplete: false, nextPlayer }
    }
  }

  _endGame() {
    // Use flow controller to check game end conditions (4.4.10)
    const endResult = this.flowController.checkGameEndConditions()

    this.gameState.set('isGameOver', true)
    this.flowController.setGameState(GAME_STATES.GAME_OVER)

    if (endResult.result === 'collective_loss') {
      this.gameState.set('winner', null)
      this.gameState.set('gameEndResult', endResult)
      this.gameState.addToHistory({
        type: 'game_end',
        result: 'collective_loss',
        message: endResult.message
      })
    } else {
      const winner = endResult.winner
      this.gameState.set('winner', winner)
      this.gameState.set('gameEndResult', endResult)
      this.gameState.addToHistory({
        type: 'game_end',
        result: 'winner',
        winnerIndex: winner.index,
        winnerName: winner.name,
        victoryPoints: winner.victoryPoints,
        rankings: endResult.rankings.map(p => ({
          name: p.name,
          victoryPoints: p.victoryPoints,
          monsters: p.capturedMonsters.length
        }))
      })
    }

    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(this.gameState.get('winner'), endResult)
    }
  }

  /**
   * Get current player's treasure cards
   */
  getCurrentPlayerCards() {
    const player = this.turnManager.getCurrentPlayer()
    return player ? player.treasureCards : []
  }

  /**
   * Get current player's monsters
   */
  getCurrentPlayerMonsters() {
    const player = this.turnManager.getCurrentPlayer()
    return player ? player.capturedMonsters : []
  }

  getGameSummary() {
    const players = this.gameState.get('players')
    return {
      currentDay: this.gameState.get('currentDay'),
      maxDays: this.gameState.get('maxDays'),
      currentPhase: this.gameState.get('currentPhase'),
      currentPlayerIndex: this.gameState.get('currentPlayerIndex'),
      firstPlayerIndex: this.gameState.get('firstPlayerIndex'),
      players: players.map((p) => ({
        ...p.getSummary(),
        treasureCards: p.treasureCards,
        capturedMonsters: p.capturedMonsters,
      })),
      caves: this.gameState.get('caves').map((c) => c.getInfo()),
      ancientBeasts: this.gameState.get('ancientBeasts'),
      isGameOver: this.gameState.get('isGameOver'),
      winner: this.gameState.get('winner')?.getSummary() || null,
      combat: this.gameState.get('combat'),
      currentEvent: this.gameState.get('currentEvent'),
      flowState: this.flowController.getFlowState(),
    }
  }
}

// Re-export flow states for external use
export { GAME_STATES, TURN_STATES, COMBAT_STATES } from './GameFlowController.js'
