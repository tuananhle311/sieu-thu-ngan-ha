/**
 * Turn Manager
 * Handles turn order and progression within a round
 */

export class TurnManager {
  constructor(gameState) {
    this.gameState = gameState
  }

  /**
   * Start turns for the current phase
   * Sets current player to the first player
   */
  startTurns() {
    const firstPlayerIndex = this.gameState.get('firstPlayerIndex')
    this.gameState.set('currentPlayerIndex', firstPlayerIndex)
  }

  /**
   * End the current player's turn and move to the next player
   * @returns {boolean} True if all players have had their turn
   */
  endTurn() {
    const currentIndex = this.gameState.get('currentPlayerIndex')
    const playerCount = this.gameState.getPlayerCount()
    const firstPlayerIndex = this.gameState.get('firstPlayerIndex')

    // Calculate next player index (clockwise)
    const nextIndex = (currentIndex + 1) % playerCount

    // Check if we've gone full circle (back to first player)
    if (nextIndex === firstPlayerIndex) {
      return true // All players have had their turn
    }

    this.gameState.set('currentPlayerIndex', nextIndex)
    return false
  }

  /**
   * Rotate the first player to the next player (clockwise)
   * Called at the end of each day
   */
  rotateFirstPlayer() {
    const currentFirst = this.gameState.get('firstPlayerIndex')
    const playerCount = this.gameState.getPlayerCount()
    const newFirst = (currentFirst + 1) % playerCount
    this.gameState.set('firstPlayerIndex', newFirst)
  }

  /**
   * Get the current player
   * @returns {Object} Current player object
   */
  getCurrentPlayer() {
    return this.gameState.getCurrentPlayer()
  }

  /**
   * Get the player to the right (for monster dice rolls)
   * @param {number} playerIndex - Player index
   * @returns {Object} Player to the right
   */
  getPlayerToRight(playerIndex) {
    const playerCount = this.gameState.getPlayerCount()
    const rightIndex = (playerIndex + 1) % playerCount
    return this.gameState.getPlayer(rightIndex)
  }

  /**
   * Get the player to the left
   * @param {number} playerIndex - Player index
   * @returns {Object} Player to the left
   */
  getPlayerToLeft(playerIndex) {
    const playerCount = this.gameState.getPlayerCount()
    const leftIndex = (playerIndex - 1 + playerCount) % playerCount
    return this.gameState.getPlayer(leftIndex)
  }

  /**
   * Get all other players (excluding current)
   * @returns {Array} Array of other player objects
   */
  getOtherPlayers() {
    const currentIndex = this.gameState.get('currentPlayerIndex')
    const players = this.gameState.getPlayers()
    return players.filter((_, index) => index !== currentIndex)
  }

  /**
   * Check if it's a specific player's turn
   * @param {number} playerIndex - Player index to check
   * @returns {boolean} True if it's that player's turn
   */
  isPlayerTurn(playerIndex) {
    return this.gameState.get('currentPlayerIndex') === playerIndex
  }

  /**
   * Get turn order starting from first player
   * @returns {Array} Array of player indices in turn order
   */
  getTurnOrder() {
    const playerCount = this.gameState.getPlayerCount()
    const firstPlayer = this.gameState.get('firstPlayerIndex')
    const order = []

    for (let i = 0; i < playerCount; i++) {
      order.push((firstPlayer + i) % playerCount)
    }

    return order
  }

  /**
   * Skip current player's turn (e.g., due to event effect)
   * @returns {boolean} True if all players have had their turn
   */
  skipTurn() {
    // Record that turn was skipped
    this.gameState.addToHistory({
      type: 'skip_turn',
      playerIndex: this.gameState.get('currentPlayerIndex'),
    })
    return this.endTurn()
  }
}
