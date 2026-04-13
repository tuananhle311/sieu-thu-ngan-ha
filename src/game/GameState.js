/**
 * Game State Management with Observer Pattern
 * Manages all game data and notifies observers of changes
 */

// Game phases within a round
export const PHASES = {
  DAILY_REWARD: 'daily_reward',
  EVENT: 'event',
  PLAYER_TURNS: 'player_turns',
  DAY_END: 'day_end',
}

// Player action types
export const ACTIONS = {
  ENTER_CAVE: 'enter_cave',
  CAPTURE_BEAST: 'capture_beast',
  PASS: 'pass',
  USE_SKILL: 'use_skill',
  PLAY_CARD: 'play_card',
}

export class GameState {
  constructor() {
    this._observers = new Map()
    this._state = {
      // Game progress
      currentDay: 1,
      maxDays: 8,
      currentPhase: PHASES.DAILY_REWARD,
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      isGameOver: false,
      winner: null,

      // Players
      players: [],

      // Board
      caves: [],
      ancientBeastCaves: [],

      // Decks
      monsterDeck: [],
      monsterDiscard: [],
      treasureDeck: [],
      treasureDiscard: [],
      eventDeck: [],
      eventDiscard: [],

      // Ancient beasts (available for capture)
      ancientBeasts: [],

      // Current event card (if any)
      currentEvent: null,

      // Combat state
      combat: null,

      // Action history for undo/replay
      history: [],
    }
  }

  /**
   * Get current state (read-only copy)
   */
  get state() {
    return { ...this._state }
  }

  /**
   * Get specific state property
   * @param {string} key - State key
   */
  get(key) {
    return this._state[key]
  }

  /**
   * Update state and notify observers
   * @param {string} key - State key to update
   * @param {*} value - New value
   */
  set(key, value) {
    const oldValue = this._state[key]
    this._state[key] = value
    this._notify(key, value, oldValue)
  }

  /**
   * Update multiple state properties at once
   * @param {Object} updates - Object with key-value pairs to update
   */
  update(updates) {
    const changes = []
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this._state[key]
      this._state[key] = value
      changes.push({ key, value, oldValue })
    }
    // Notify all changes
    for (const change of changes) {
      this._notify(change.key, change.value, change.oldValue)
    }
  }

  /**
   * Subscribe to state changes
   * @param {string} key - State key to observe ('*' for all)
   * @param {Function} callback - Callback function(newValue, oldValue, key)
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._observers.has(key)) {
      this._observers.set(key, new Set())
    }
    this._observers.get(key).add(callback)

    // Return unsubscribe function
    return () => {
      this._observers.get(key).delete(callback)
    }
  }

  /**
   * Notify observers of a state change
   * @private
   */
  _notify(key, newValue, oldValue) {
    // Notify specific key observers
    if (this._observers.has(key)) {
      for (const callback of this._observers.get(key)) {
        callback(newValue, oldValue, key)
      }
    }
    // Notify wildcard observers
    if (this._observers.has('*')) {
      for (const callback of this._observers.get('*')) {
        callback(newValue, oldValue, key)
      }
    }
  }

  /**
   * Get current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer() {
    return this._state.players[this._state.currentPlayerIndex]
  }

  /**
   * Get first player (starts the round)
   * @returns {Object} First player object
   */
  getFirstPlayer() {
    return this._state.players[this._state.firstPlayerIndex]
  }

  /**
   * Get player by index
   * @param {number} index - Player index
   * @returns {Object} Player object
   */
  getPlayer(index) {
    return this._state.players[index]
  }

  /**
   * Get all players
   * @returns {Array} Array of player objects
   */
  getPlayers() {
    return [...this._state.players]
  }

  /**
   * Get number of players
   * @returns {number} Player count
   */
  getPlayerCount() {
    return this._state.players.length
  }

  /**
   * Add action to history
   * @param {Object} action - Action object
   */
  addToHistory(action) {
    this._state.history.push({
      ...action,
      timestamp: Date.now(),
      day: this._state.currentDay,
      phase: this._state.currentPhase,
    })
  }

  /**
   * Reset state for a new game
   */
  reset() {
    this._state = {
      currentDay: 1,
      maxDays: 8,
      currentPhase: PHASES.DAILY_REWARD,
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      isGameOver: false,
      winner: null,
      players: [],
      caves: [],
      ancientBeastCaves: [],
      monsterDeck: [],
      monsterDiscard: [],
      treasureDeck: [],
      treasureDiscard: [],
      eventDeck: [],
      eventDiscard: [],
      ancientBeasts: [],
      currentEvent: null,
      combat: null,
      history: [],
    }
    this._notify('reset', this._state, null)
  }

  /**
   * Serialize state for save/load
   * @returns {string} JSON string
   */
  serialize() {
    return JSON.stringify(this._state)
  }

  /**
   * Load state from serialized data
   * @param {string} json - JSON string
   */
  deserialize(json) {
    const oldState = { ...this._state }
    this._state = JSON.parse(json)
    this._notify('load', this._state, oldState)
  }
}
