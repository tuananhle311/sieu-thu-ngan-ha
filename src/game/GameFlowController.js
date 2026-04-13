/**
 * Game Flow Controller
 * Centralized controller for all gameplay flow logic
 * Implements state machines as documented in game.md section 4.4
 */

import { PHASES } from './GameState.js'

// Game States (4.4.1)
export const GAME_STATES = {
  MENU: 'menu',
  CHARACTER_SELECT: 'character_select',
  GAME_INIT: 'game_init',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
}

// Turn States (4.4.3)
export const TURN_STATES = {
  START_TURN: 'start_turn',
  CHOOSE_ACTION: 'choose_action',
  ENTER_CAVE: 'enter_cave',
  CAPTURE_BEAST: 'capture_beast',
  USE_SKILL: 'use_skill',
  PASS: 'pass',
  COMBAT: 'combat',
  SACRIFICE: 'sacrifice',
  APPLY_EFFECT: 'apply_effect',
  RESOLVE: 'resolve',
  GET_REWARDS: 'get_rewards',
  MARK_USED: 'mark_used',
  END_TURN: 'end_turn'
}

// Combat States (4.4.4)
export const COMBAT_STATES = {
  PAY_COST: 'pay_cost',
  PLAYER_ROLL: 'player_roll',
  PLAYER_MODIFY: 'player_modify',
  CALCULATE_PLAYER_POWER: 'calculate_player_power',
  MONSTER_ROLL: 'monster_roll',
  CALCULATE_MONSTER_POWER: 'calculate_monster_power',
  COMPARE_POWERS: 'compare_powers',
  APPLY_RESULT: 'apply_result',
  END_COMBAT: 'end_combat'
}

// Timing Windows (4.4.5)
export const TIMING_WINDOWS = {
  ANYTIME: 'anytime',
  YOUR_TURN: 'your_turn',
  COMBAT_BEFORE_ROLL: 'combat_before_roll',
  COMBAT_AFTER_ROLL: 'combat_after_roll',
  COMBAT_BEFORE_RESOLVE: 'combat_before_resolve',
  EVENT_PHASE: 'event_phase',
  RESPONSE: 'response'
}

export class GameFlowController {
  constructor(gameState) {
    this.gameState = gameState

    // Current states
    this.gameFlowState = GAME_STATES.MENU
    this.turnState = null
    this.combatState = null

    // Timing window stack (for response cards)
    this.timingStack = []
    this.currentTimingWindow = null

    // Pending actions queue
    this.pendingActions = []

    // Event callbacks
    this.callbacks = {
      onGameStateChange: null,
      onTurnStateChange: null,
      onCombatStateChange: null,
      onTimingWindowOpen: null,
      onTimingWindowClose: null,
      onActionRequired: null
    }
  }

  /**
   * Register callback
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback
    }
  }

  /**
   * Emit event
   */
  emit(event, ...args) {
    if (this.callbacks[event]) {
      this.callbacks[event](...args)
    }
  }

  // ==========================================
  // GAME STATE MACHINE (4.4.1)
  // ==========================================

  /**
   * Transition game state
   */
  setGameState(newState) {
    const oldState = this.gameFlowState
    this.gameFlowState = newState

    this.gameState.addToHistory({
      type: 'game_state_change',
      from: oldState,
      to: newState
    })

    this.emit('onGameStateChange', newState, oldState)
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameFlowState
  }

  /**
   * Check if game is in playing state
   */
  isPlaying() {
    return this.gameFlowState === GAME_STATES.PLAYING
  }

  // ==========================================
  // PHASE STATE MACHINE (4.4.2)
  // ==========================================

  /**
   * Get phase sequence
   */
  getPhaseSequence() {
    return [
      PHASES.DAILY_REWARD,
      PHASES.EVENT,
      PHASES.PLAYER_TURNS,
      PHASES.DAY_END
    ]
  }

  /**
   * Check if should skip daily reward (day 1)
   */
  shouldSkipDailyReward() {
    return this.gameState.get('currentDay') === 1
  }

  /**
   * Check if game should end
   */
  shouldEndGame() {
    return this.gameState.get('currentDay') >= this.gameState.get('maxDays')
  }

  // ==========================================
  // TURN STATE MACHINE (4.4.3)
  // ==========================================

  /**
   * Start a new turn
   */
  startTurn(player) {
    this.turnState = TURN_STATES.START_TURN

    // Reset turn flags
    player.hasActedThisTurn = false
    player.turnAction = null

    // Open timing window for anytime skills/cards
    this.openTimingWindow(TIMING_WINDOWS.YOUR_TURN, player)

    this.emit('onTurnStateChange', this.turnState)

    // Transition to choose action
    this.turnState = TURN_STATES.CHOOSE_ACTION
    this.emit('onTurnStateChange', this.turnState)
    this.emit('onActionRequired', player, this.getAvailableActions(player))
  }

  /**
   * Get available actions for player
   */
  getAvailableActions(player) {
    const actions = []

    // Check skip turn flag
    if (player.skipNextTurn) {
      player.skipNextTurn = false
      return ['forced_pass']
    }

    // Enter cave - check if player has chicken legs
    const caves = this.gameState.get('caves')
    const affordableCaves = caves.filter((cave, index) =>
      cave.hasMonster() && player.canAfford(cave.cost)
    )
    if (affordableCaves.length > 0) {
      actions.push('enter_cave')
    }

    // Capture beast - check requirements
    const ancientBeasts = this.gameState.get('ancientBeasts')
    const capturableBeasts = ancientBeasts.filter(beast =>
      player.canCaptureAncientBeast(beast)
    )
    if (capturableBeasts.length > 0) {
      actions.push('capture_beast')
    }

    // Use skill - check if available and in-turn timing
    if (player.canUseSkill() && player.character) {
      const timing = player.character.timing
      if (timing === 'in_turn') {
        actions.push('use_skill')
      }
    }

    // Pass is always available
    actions.push('pass')

    return actions
  }

  /**
   * Execute turn action
   */
  executeTurnAction(action, params = {}) {
    switch (action) {
      case 'enter_cave':
        this.turnState = TURN_STATES.ENTER_CAVE
        this.emit('onTurnStateChange', this.turnState)
        return { nextState: TURN_STATES.COMBAT, params }

      case 'capture_beast':
        this.turnState = TURN_STATES.CAPTURE_BEAST
        this.emit('onTurnStateChange', this.turnState)
        return { nextState: TURN_STATES.SACRIFICE, params }

      case 'use_skill':
        this.turnState = TURN_STATES.USE_SKILL
        this.emit('onTurnStateChange', this.turnState)
        return { nextState: TURN_STATES.APPLY_EFFECT, params }

      case 'pass':
      case 'forced_pass':
        this.turnState = TURN_STATES.PASS
        this.emit('onTurnStateChange', this.turnState)
        return { nextState: TURN_STATES.END_TURN, params }

      default:
        return { nextState: TURN_STATES.CHOOSE_ACTION, params }
    }
  }

  /**
   * End turn
   */
  endTurn() {
    this.turnState = TURN_STATES.END_TURN
    this.closeTimingWindow()
    this.emit('onTurnStateChange', this.turnState)
    this.turnState = null
  }

  // ==========================================
  // COMBAT FLOW (4.4.4)
  // ==========================================

  /**
   * Start combat
   */
  startCombat(player, cave) {
    this.combatState = COMBAT_STATES.PAY_COST
    this.emit('onCombatStateChange', this.combatState)

    return {
      player,
      cave,
      monster: cave.monster,
      cost: cave.cost,
      playerDice: null,
      playerDiceModified: null,
      monsterDice: null,
      playerPower: 0,
      monsterPower: 0,
      modifiers: [],
      pendingEffects: [],
      autoWin: false,
      autoLose: false,
      allySupport: null,
      result: null
    }
  }

  /**
   * Process combat step
   */
  processCombatStep(combat, step, data = {}) {
    switch (step) {
      case COMBAT_STATES.PAY_COST:
        this.combatState = COMBAT_STATES.PAY_COST
        // Deduct chicken legs
        combat.player.removeChickenLegs(combat.cost)
        combat.modifiers.push({ type: 'cost_paid', value: combat.cost })
        return COMBAT_STATES.PLAYER_ROLL

      case COMBAT_STATES.PLAYER_ROLL:
        this.combatState = COMBAT_STATES.PLAYER_ROLL
        // Open timing window for pre-roll effects
        this.openTimingWindow(TIMING_WINDOWS.COMBAT_BEFORE_ROLL, combat.player)
        return COMBAT_STATES.PLAYER_MODIFY

      case COMBAT_STATES.PLAYER_MODIFY:
        this.combatState = COMBAT_STATES.PLAYER_MODIFY
        // Open timing window for dice modification
        this.openTimingWindow(TIMING_WINDOWS.COMBAT_AFTER_ROLL, combat.player)
        return COMBAT_STATES.CALCULATE_PLAYER_POWER

      case COMBAT_STATES.CALCULATE_PLAYER_POWER:
        this.combatState = COMBAT_STATES.CALCULATE_PLAYER_POWER
        this._calculatePlayerPower(combat)
        return COMBAT_STATES.MONSTER_ROLL

      case COMBAT_STATES.MONSTER_ROLL:
        this.combatState = COMBAT_STATES.MONSTER_ROLL
        return COMBAT_STATES.CALCULATE_MONSTER_POWER

      case COMBAT_STATES.CALCULATE_MONSTER_POWER:
        this.combatState = COMBAT_STATES.CALCULATE_MONSTER_POWER
        this._calculateMonsterPower(combat)
        // Open timing window for before-resolve effects
        this.openTimingWindow(TIMING_WINDOWS.COMBAT_BEFORE_RESOLVE, combat.player)
        return COMBAT_STATES.COMPARE_POWERS

      case COMBAT_STATES.COMPARE_POWERS:
        this.combatState = COMBAT_STATES.COMPARE_POWERS
        this._comparePowers(combat)
        return COMBAT_STATES.APPLY_RESULT

      case COMBAT_STATES.APPLY_RESULT:
        this.combatState = COMBAT_STATES.APPLY_RESULT
        return COMBAT_STATES.END_COMBAT

      case COMBAT_STATES.END_COMBAT:
        this.combatState = COMBAT_STATES.END_COMBAT
        this.closeTimingWindow()
        this.combatState = null
        return null
    }

    this.emit('onCombatStateChange', this.combatState)
    return step
  }

  /**
   * Calculate player power (4.4.4 step 3)
   */
  _calculatePlayerPower(combat) {
    let power = combat.playerDiceModified || combat.playerDice || 0

    // Add permanent power (from Fire monsters)
    power += combat.player.permanentPower
    combat.modifiers.push({
      type: 'permanent_power',
      value: combat.player.permanentPower,
      source: 'Fire monsters'
    })

    // Add ancient beast bonuses
    for (const beast of combat.player.ancientBeasts) {
      if (beast.dailyBonus.type === 'combatPower') {
        power += beast.dailyBonus.value
        combat.modifiers.push({
          type: 'beast_bonus',
          value: beast.dailyBonus.value,
          source: beast.name
        })
      }
    }

    // Add pending effects (from cards/skills)
    for (const effect of combat.pendingEffects) {
      if (effect.type === 'combat_power_bonus') {
        power += effect.value
        combat.modifiers.push({
          type: 'effect_bonus',
          value: effect.value,
          source: effect.source
        })
      }
    }

    // Add ally support (Cancer skill)
    if (combat.allySupport) {
      power += combat.allySupport.power
      combat.modifiers.push({
        type: 'ally_support',
        value: combat.allySupport.power,
        source: combat.allySupport.source
      })
    }

    combat.playerPower = power
  }

  /**
   * Calculate monster power (4.4.4 step 5)
   */
  _calculateMonsterPower(combat) {
    let power = combat.monsterDice || 0
    let basePower = combat.monster.power

    // Check if Virgo skill removed monster power
    for (const effect of combat.pendingEffects) {
      if (effect.type === 'remove_monster_power') {
        basePower = 0
        combat.modifiers.push({
          type: 'power_removed',
          value: -combat.monster.power,
          source: effect.source
        })
      }
    }

    power += basePower
    combat.monsterPower = power
  }

  /**
   * Compare powers and determine winner (4.4.4 step 6)
   */
  _comparePowers(combat) {
    // Check auto-win first
    if (combat.autoWin) {
      combat.result = { playerWins: true, reason: 'auto_win' }
      return
    }

    // Check auto-lose
    if (combat.autoLose) {
      combat.result = { playerWins: false, reason: 'auto_lose' }
      return
    }

    // Normal comparison: Player >= Monster = Win
    const playerWins = combat.playerPower >= combat.monsterPower
    combat.result = {
      playerWins,
      playerPower: combat.playerPower,
      monsterPower: combat.monsterPower,
      reason: 'comparison'
    }
  }

  // ==========================================
  // TIMING WINDOWS (4.4.5)
  // ==========================================

  /**
   * Open a timing window
   */
  openTimingWindow(windowType, activePlayer) {
    this.timingStack.push(this.currentTimingWindow)
    this.currentTimingWindow = {
      type: windowType,
      activePlayer,
      responses: [],
      isOpen: true
    }
    this.emit('onTimingWindowOpen', this.currentTimingWindow)
  }

  /**
   * Close current timing window
   */
  closeTimingWindow() {
    const closed = this.currentTimingWindow
    this.currentTimingWindow = this.timingStack.pop() || null
    if (closed) {
      this.emit('onTimingWindowClose', closed)
    }
  }

  /**
   * Check if a card can be played in current timing
   */
  canPlayCardInTiming(card, player) {
    if (!this.currentTimingWindow) {
      // No active timing window, check card type
      return card.type === 'instant'
    }

    const windowType = this.currentTimingWindow.type

    // Instant cards can be played anytime
    if (card.type === 'instant') {
      return true
    }

    // Action cards only during your turn
    if (card.type === 'action') {
      return windowType === TIMING_WINDOWS.YOUR_TURN &&
             this.currentTimingWindow.activePlayer === player
    }

    return false
  }

  /**
   * Check if a skill can be used in current timing
   */
  canUseSkillInTiming(player) {
    if (!player.character || player.skillUsed) {
      return false
    }

    const timing = player.character.timing

    // Anytime skills
    if (timing === 'anytime') {
      return true
    }

    // In-turn skills
    if (timing === 'in_turn') {
      if (!this.currentTimingWindow) return false
      return this.currentTimingWindow.type === TIMING_WINDOWS.YOUR_TURN &&
             this.currentTimingWindow.activePlayer === player
    }

    return false
  }

  // ==========================================
  // ANCIENT BEAST CAPTURE FLOW (4.4.6)
  // ==========================================

  /**
   * Validate beast capture requirements
   */
  validateBeastCapture(player, beast, selectedMonsters) {
    const requirement = beast.requirement

    // Check total count
    if (selectedMonsters.length !== 3) {
      return { valid: false, error: 'Must select exactly 3 monsters' }
    }

    // Count required element
    const requiredCount = selectedMonsters.filter(
      m => m.element === requirement.requiredElement
    ).length

    if (requiredCount < requirement.sameElement) {
      return {
        valid: false,
        error: `Need at least ${requirement.sameElement} ${requirement.requiredElement} monsters`
      }
    }

    return { valid: true }
  }

  /**
   * Get beast capture rewards (4.4.6 step 5)
   */
  getBeastCaptureRewards(beast) {
    return {
      victoryPoints: beast.victoryPoints,
      immediate: beast.immediateReward,
      daily: beast.dailyBonus
    }
  }

  // ==========================================
  // EVENT FLOW (4.4.7)
  // ==========================================

  /**
   * Start event phase
   */
  startEventPhase() {
    this.openTimingWindow(TIMING_WINDOWS.EVENT_PHASE, null)
  }

  /**
   * Check if event is blocked
   */
  isEventBlocked(context) {
    return context.eventBlocked === true
  }

  /**
   * Check if Leo skill redirects event
   */
  checkLeoRedirect(context) {
    return context.eventTarget || null
  }

  // ==========================================
  // GAME END CONDITIONS (4.4.10)
  // ==========================================

  /**
   * Check game end conditions
   */
  checkGameEndConditions() {
    const players = this.gameState.get('players')

    // Check if any ancient beast was captured
    const anyBeastCaptured = players.some(p => p.ancientBeasts.length > 0)

    if (!anyBeastCaptured) {
      return {
        gameOver: true,
        result: 'collective_loss',
        message: 'No ancient beasts captured - Galaxy destroyed!'
      }
    }

    // Sort by victory points (descending)
    const sortedPlayers = [...players].sort((a, b) => {
      // Primary: Victory points
      if (b.victoryPoints !== a.victoryPoints) {
        return b.victoryPoints - a.victoryPoints
      }
      // Tiebreaker 1: Most captured monsters
      if (b.capturedMonsters.length !== a.capturedMonsters.length) {
        return b.capturedMonsters.length - a.capturedMonsters.length
      }
      // Tiebreaker 2: Most chicken legs
      return b.chickenLegs - a.chickenLegs
    })

    const winner = sortedPlayers[0]

    return {
      gameOver: true,
      result: 'winner',
      winner: winner,
      rankings: sortedPlayers,
      message: `${winner.name} wins with ${winner.victoryPoints} victory points!`
    }
  }

  // ==========================================
  // WIN PROBABILITY (4.4.9)
  // ==========================================

  /**
   * Calculate win probability
   */
  calculateWinProbability(player, monster, bonuses = 0) {
    const avgDice = 3.5
    const avgPlayerPower = avgDice + player.permanentPower + bonuses
    const avgMonsterPower = avgDice + monster.power

    // Formula from 4.4.9
    const winProbability = Math.max(0, Math.min(1,
      0.5 + (avgPlayerPower - avgMonsterPower) * 0.15
    ))

    return {
      probability: winProbability,
      percentage: Math.round(winProbability * 100),
      avgPlayerPower,
      avgMonsterPower
    }
  }

  // ==========================================
  // STATE SERIALIZATION
  // ==========================================

  /**
   * Get full flow state for save/debug
   */
  getFlowState() {
    return {
      gameState: this.gameFlowState,
      turnState: this.turnState,
      combatState: this.combatState,
      currentTimingWindow: this.currentTimingWindow,
      timingStackDepth: this.timingStack.length
    }
  }
}
