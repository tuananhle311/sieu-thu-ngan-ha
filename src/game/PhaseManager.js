/**
 * Phase Manager
 * Handles the execution of phases within each round/day
 */

import { PHASES } from './GameState.js'

export class PhaseManager {
  constructor(gameState, turnManager) {
    this.gameState = gameState
    this.turnManager = turnManager
    this.phaseHandlers = new Map()
  }

  /**
   * Register a handler for a specific phase
   * @param {string} phase - Phase name
   * @param {Function} handler - Handler function
   */
  registerPhaseHandler(phase, handler) {
    this.phaseHandlers.set(phase, handler)
  }

  /**
   * Get the sequence of phases for a round
   * @returns {Array} Array of phase names in order
   */
  getPhaseSequence() {
    return [
      PHASES.DAILY_REWARD,
      PHASES.EVENT,
      PHASES.PLAYER_TURNS,
      PHASES.DAY_END,
    ]
  }

  /**
   * Start a new day/round
   */
  startDay() {
    const currentDay = this.gameState.get('currentDay')

    this.gameState.addToHistory({
      type: 'day_start',
      day: currentDay,
    })

    // Start with the first phase
    this.setPhase(PHASES.DAILY_REWARD)
  }

  /**
   * Set the current phase
   * @param {string} phase - Phase to set
   */
  setPhase(phase) {
    const oldPhase = this.gameState.get('currentPhase')
    this.gameState.set('currentPhase', phase)

    this.gameState.addToHistory({
      type: 'phase_change',
      from: oldPhase,
      to: phase,
    })
  }

  /**
   * Execute the current phase
   * @returns {Promise} Resolves when phase is complete
   */
  async executeCurrentPhase() {
    const currentPhase = this.gameState.get('currentPhase')
    const handler = this.phaseHandlers.get(currentPhase)

    if (handler) {
      await handler()
    }
  }

  /**
   * Execute daily reward phase
   * Each player receives 1 chicken leg and 1 treasure card
   * (Skipped on day 1 as players already received starting resources)
   */
  executeDailyRewardPhase() {
    const currentDay = this.gameState.get('currentDay')

    // Skip on day 1 (players already got starting resources)
    if (currentDay === 1) {
      return
    }

    const players = this.gameState.getPlayers()

    for (const player of players) {
      // Give 1 chicken leg
      player.chickenLegs += 1

      // Draw 1 treasure card (handled by CardSystem)
      // This will be coordinated by GameEngine

      this.gameState.addToHistory({
        type: 'daily_reward',
        playerIndex: players.indexOf(player),
        rewards: { chickenLegs: 1, treasureCards: 1 },
      })
    }

    // Update players in state
    this.gameState.set('players', [...players])
  }

  /**
   * Check if day 1 (skip daily rewards)
   * @returns {boolean} True if day 1
   */
  isFirstDay() {
    return this.gameState.get('currentDay') === 1
  }

  /**
   * Advance to the next phase
   * @returns {boolean} True if day is complete
   */
  nextPhase() {
    const currentPhase = this.gameState.get('currentPhase')
    const sequence = this.getPhaseSequence()
    const currentIndex = sequence.indexOf(currentPhase)

    if (currentIndex < sequence.length - 1) {
      // Move to next phase
      this.setPhase(sequence[currentIndex + 1])
      return false
    } else {
      // Day is complete
      return true
    }
  }

  /**
   * End the current day and prepare for the next
   */
  endDay() {
    const currentDay = this.gameState.get('currentDay')
    const maxDays = this.gameState.get('maxDays')

    this.gameState.addToHistory({
      type: 'day_end',
      day: currentDay,
    })

    // Rotate first player clockwise
    this.turnManager.rotateFirstPlayer()

    // Check if game is over
    if (currentDay >= maxDays) {
      this.gameState.set('isGameOver', true)
      return true
    }

    // Advance to next day
    this.gameState.set('currentDay', currentDay + 1)
    return false
  }

  /**
   * Get current phase name
   * @returns {string} Current phase
   */
  getCurrentPhase() {
    return this.gameState.get('currentPhase')
  }

  /**
   * Check if we're in the player turns phase
   * @returns {boolean} True if in player turns phase
   */
  isPlayerTurnsPhase() {
    return this.gameState.get('currentPhase') === PHASES.PLAYER_TURNS
  }

  /**
   * Check if we're in the event phase
   * @returns {boolean} True if in event phase
   */
  isEventPhase() {
    return this.gameState.get('currentPhase') === PHASES.EVENT
  }

  /**
   * Check if we're in the daily reward phase
   * @returns {boolean} True if in daily reward phase
   */
  isDailyRewardPhase() {
    return this.gameState.get('currentPhase') === PHASES.DAILY_REWARD
  }

  /**
   * Check if we're in the day end phase
   * @returns {boolean} True if in day end phase
   */
  isDayEndPhase() {
    return this.gameState.get('currentPhase') === PHASES.DAY_END
  }

  /**
   * Get progress info for UI display
   * @returns {Object} Progress information
   */
  getProgressInfo() {
    return {
      currentDay: this.gameState.get('currentDay'),
      maxDays: this.gameState.get('maxDays'),
      currentPhase: this.gameState.get('currentPhase'),
      firstPlayerIndex: this.gameState.get('firstPlayerIndex'),
      currentPlayerIndex: this.gameState.get('currentPlayerIndex'),
    }
  }
}
