/**
 * Multiplayer Manager
 * Handles WebSocket connection and game synchronization
 */

export class MultiplayerManager {
  constructor() {
    this.ws = null
    this.connected = false
    this.roomCode = null
    this.playerId = null
    this.isHost = false
    this.players = []
    this.callbacks = {
      onConnected: null,
      onDisconnected: null,
      onError: null,
      onRoomCreated: null,
      onRoomJoined: null,
      onPlayerJoined: null,
      onPlayerLeft: null,
      onGameStarted: null,
      onGameAction: null,
      onStateSync: null
    }
  }

  /**
   * Register event callback
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback
    }
  }

  /**
   * Connect to multiplayer server
   */
  connect(serverUrl = 'ws://localhost:3001') {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(serverUrl)

        this.ws.onopen = () => {
          console.log('Connected to multiplayer server')
          this.connected = true
          if (this.callbacks.onConnected) {
            this.callbacks.onConnected()
          }
          resolve()
        }

        this.ws.onclose = () => {
          console.log('Disconnected from server')
          this.connected = false
          this.roomCode = null
          this.playerId = null
          if (this.callbacks.onDisconnected) {
            this.callbacks.onDisconnected()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          if (this.callbacks.onError) {
            this.callbacks.onError(error)
          }
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this._handleMessage(JSON.parse(event.data))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Create a new game room
   */
  createRoom(playerName, maxPlayers = 4) {
    this._send({
      type: 'create_room',
      playerName,
      maxPlayers
    })
  }

  /**
   * Join an existing room
   */
  joinRoom(roomCode, playerName) {
    this._send({
      type: 'join_room',
      roomCode,
      playerName
    })
  }

  /**
   * Leave current room
   */
  leaveRoom() {
    this._send({ type: 'leave_room' })
    this.roomCode = null
    this.playerId = null
    this.isHost = false
    this.players = []
  }

  /**
   * Start the game (host only)
   */
  startGame(initialState) {
    if (!this.isHost) {
      console.error('Only host can start game')
      return
    }
    this._send({
      type: 'start_game',
      initialState
    })
  }

  /**
   * Send game action to all players
   */
  sendAction(action, data) {
    this._send({
      type: 'game_action',
      action,
      data
    })
  }

  /**
   * Sync game state (host only)
   */
  syncState(gameState) {
    if (this.isHost) {
      this._send({
        type: 'sync_state',
        gameState
      })
    }
  }

  /**
   * Check if in a room
   */
  isInRoom() {
    return this.roomCode !== null
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected
  }

  /**
   * Get current player info
   */
  getPlayerInfo() {
    return {
      playerId: this.playerId,
      isHost: this.isHost,
      roomCode: this.roomCode
    }
  }

  /**
   * Send message to server
   * @private
   */
  _send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  /**
   * Handle incoming message
   * @private
   */
  _handleMessage(message) {
    console.log('Received:', message.type)

    switch (message.type) {
      case 'connected':
        // Initial connection confirmed
        break

      case 'room_created':
        this.roomCode = message.roomCode
        this.playerId = message.playerId
        this.isHost = true
        this.players = message.players
        if (this.callbacks.onRoomCreated) {
          this.callbacks.onRoomCreated(message.roomCode, message.players)
        }
        break

      case 'room_joined':
        this.roomCode = message.roomCode
        this.playerId = message.playerId
        this.isHost = false
        this.players = message.players
        if (this.callbacks.onRoomJoined) {
          this.callbacks.onRoomJoined(message.roomCode, message.playerId, message.players)
        }
        break

      case 'player_joined':
        this.players = message.players
        if (this.callbacks.onPlayerJoined) {
          this.callbacks.onPlayerJoined(message.player, message.players)
        }
        break

      case 'player_left':
        this.players = message.players
        if (this.callbacks.onPlayerLeft) {
          this.callbacks.onPlayerLeft(message.playerId, message.players)
        }
        break

      case 'game_started':
        if (this.callbacks.onGameStarted) {
          this.callbacks.onGameStarted(message.gameState, message.players)
        }
        break

      case 'game_action':
        if (this.callbacks.onGameAction) {
          this.callbacks.onGameAction(message.playerId, message.action, message.data)
        }
        break

      case 'state_sync':
        if (this.callbacks.onStateSync) {
          this.callbacks.onStateSync(message.gameState)
        }
        break

      case 'error':
        console.error('Server error:', message.message)
        if (this.callbacks.onError) {
          this.callbacks.onError(new Error(message.message))
        }
        break

      case 'host_changed':
        if (message.newHostId === this.playerId) {
          this.isHost = true
        }
        break
    }
  }
}

// Singleton instance
export const multiplayer = new MultiplayerManager()
