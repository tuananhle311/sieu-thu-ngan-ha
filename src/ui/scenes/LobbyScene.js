/**
 * Lobby Scene
 * Multiplayer room creation and joining
 */

import { BaseScene } from './BaseScene.js'
import { multiplayer } from '../../network/MultiplayerManager.js'

export class LobbyScene extends BaseScene {
  init(data) {
    super.init(data)

    this.state = 'menu' // menu, connecting, creating, joining, waiting
    this.playerName = 'Player'
    this.roomCodeInput = ''
    this.errorMessage = ''
    this.players = []
    this.copiedMessage = '' // Show "Copied!" feedback
    this.copiedTimer = 0
    this.focusedField = null // 'name' or 'code'

    // Setup multiplayer callbacks
    this._setupMultiplayerCallbacks()
    this._setupTextInput()
  }

  _setupMultiplayerCallbacks() {
    multiplayer.on('onConnected', () => {
      console.log('Connected to server')
    })

    multiplayer.on('onDisconnected', () => {
      this.state = 'menu'
      this.errorMessage = 'Disconnected from server'
    })

    multiplayer.on('onError', (error) => {
      this.errorMessage = error.message || 'Connection error'
      if (this.state === 'connecting') {
        this.state = 'menu'
      }
    })

    multiplayer.on('onRoomCreated', (roomCode, players) => {
      this.state = 'waiting'
      this.players = players
      this.errorMessage = ''
    })

    multiplayer.on('onRoomJoined', (roomCode, playerId, players) => {
      this.state = 'waiting'
      this.players = players
      this.errorMessage = ''
    })

    multiplayer.on('onPlayerJoined', (player, players) => {
      this.players = players
    })

    multiplayer.on('onPlayerLeft', (playerId, players) => {
      this.players = players
    })

    multiplayer.on('onGameStarted', (gameState, players) => {
      // Switch to character select with multiplayer mode
      this.changeScene('characterSelect', {
        multiplayer: true,
        players: players,
        playerId: multiplayer.playerId,
        isHost: multiplayer.isHost
      })
    })
  }

  async connectAndCreate() {
    this.state = 'connecting'
    this.errorMessage = ''

    try {
      if (!multiplayer.isConnected()) {
        await multiplayer.connect()
      }
      multiplayer.createRoom(this.playerName, 4)
    } catch (error) {
      this.errorMessage = 'Cannot connect to server. Make sure server is running.'
      this.state = 'menu'
    }
  }

  async connectAndJoin() {
    if (!this.roomCodeInput || this.roomCodeInput.length < 4) {
      this.errorMessage = 'Enter a valid room code'
      return
    }

    this.state = 'connecting'
    this.errorMessage = ''

    try {
      if (!multiplayer.isConnected()) {
        await multiplayer.connect()
      }
      multiplayer.joinRoom(this.roomCodeInput, this.playerName)
    } catch (error) {
      this.errorMessage = 'Cannot connect to server'
      this.state = 'menu'
    }
  }

  startGame() {
    if (!multiplayer.isHost) return
    if (this.players.length < 2) {
      this.errorMessage = 'Need at least 2 players'
      return
    }

    // Start the game - send to character select
    multiplayer.startGame({ phase: 'character_select' })
  }

  leaveRoom() {
    multiplayer.leaveRoom()
    this.state = 'menu'
    this.players = []
    this.roomCodeInput = ''
  }

  copyRoomCode() {
    const code = multiplayer.roomCode
    if (!code) return

    navigator.clipboard.writeText(code).then(() => {
      this.copiedMessage = 'Copied!'
      this.copiedTimer = 2000 // Show for 2 seconds
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      this.copiedMessage = code
      this.copiedTimer = 2000
    })
  }

  update(deltaTime) {
    super.update(deltaTime)

    // Update copied message timer
    if (this.copiedTimer > 0) {
      this.copiedTimer -= deltaTime
      if (this.copiedTimer <= 0) {
        this.copiedMessage = ''
      }
    }
  }

  render() {
    const r = this.renderer

    // Background
    r.drawRect(0, 0, r.width, r.height, '#0a0a1a')

    // Title
    r.drawCenteredText('MULTIPLAYER', r.width / 2, 60, {
      font: 'bold 48px Arial', color: '#4fc3f7'
    })

    switch (this.state) {
      case 'menu':
        this._renderMenu()
        break
      case 'connecting':
        this._renderConnecting()
        break
      case 'waiting':
        this._renderWaitingRoom()
        break
    }

    // Error message
    if (this.errorMessage) {
      r.drawCenteredText(this.errorMessage, r.width / 2, r.height - 50, {
        font: '16px Arial', color: '#ff5555'
      })
    }

    // Back button
    r.drawButton(20, 20, 100, 40, '← Back', {
      bgColor: '#333',
      hovered: this.inputHandler.isMouseOverRegion({ x: 20, y: 20, width: 100, height: 40 })
    })
    this.inputHandler.registerRegion('back', { x: 20, y: 20, width: 100, height: 40 },
      () => this.changeScene('mainMenu'))
  }

  _renderMenu() {
    const r = this.renderer
    const centerX = r.width / 2

    // Cursor blink effect
    const showCursor = Math.floor(Date.now() / 500) % 2 === 0

    // Player name input
    r.drawCenteredText('Your Name:', centerX, 150, {
      font: '18px Arial', color: '#aaa'
    })

    const nameFieldFocused = this.focusedField === 'name'
    const nameBorderColor = nameFieldFocused ? '#4caf50' : '#4fc3f7'
    const nameBgColor = nameFieldFocused ? '#1a2a3a' : '#1a1a3a'

    r.drawRect(centerX - 150, 170, 300, 50, nameBgColor, 8)
    r.drawRectOutline(centerX - 150, 170, 300, 50, nameBorderColor, nameFieldFocused ? 3 : 2, 8)

    const nameDisplay = this.playerName + (nameFieldFocused && showCursor ? '|' : '')
    r.drawCenteredText(nameDisplay || 'Click to type...', centerX, 200, {
      font: '20px Arial', color: this.playerName ? '#fff' : '#666'
    })

    // Click region for name field
    this.inputHandler.registerRegion('nameField', { x: centerX - 150, y: 170, width: 300, height: 50 },
      () => { this.focusedField = 'name' })

    // Create Room button
    r.drawButton(centerX - 150, 260, 300, 60, '+ Create Room', {
      bgColor: '#2e7d32',
      hovered: this.inputHandler.isMouseOverRegion({ x: centerX - 150, y: 260, width: 300, height: 60 })
    })
    this.inputHandler.registerRegion('createRoom', { x: centerX - 150, y: 260, width: 300, height: 60 },
      () => this.connectAndCreate())

    // OR divider
    r.drawCenteredText('— OR —', centerX, 360, {
      font: '16px Arial', color: '#666'
    })

    // Room code input
    r.drawCenteredText('Enter Room Code:', centerX, 400, {
      font: '18px Arial', color: '#aaa'
    })

    const codeFieldFocused = this.focusedField === 'code'
    const codeBorderColor = codeFieldFocused ? '#4caf50' : '#ff9800'
    const codeBgColor = codeFieldFocused ? '#1a2a3a' : '#1a1a3a'

    r.drawRect(centerX - 150, 420, 300, 50, codeBgColor, 8)
    r.drawRectOutline(centerX - 150, 420, 300, 50, codeBorderColor, codeFieldFocused ? 3 : 2, 8)

    const codeDisplay = this.roomCodeInput + (codeFieldFocused && showCursor ? '|' : '')
    const codePlaceholder = codeFieldFocused ? 'Paste or type code...' : 'Click to enter code'
    r.drawCenteredText(codeDisplay || codePlaceholder, centerX, 450, {
      font: 'bold 24px Arial', color: this.roomCodeInput ? '#fff' : '#666'
    })

    // Click region for code field
    this.inputHandler.registerRegion('codeField', { x: centerX - 150, y: 420, width: 300, height: 50 },
      () => { this.focusedField = 'code' })

    // Hint for focused field
    if (codeFieldFocused) {
      r.drawCenteredText('Ctrl+V to paste', centerX, 485, {
        font: '12px Arial', color: '#4caf50'
      })
    }

    // Join Room button
    r.drawButton(centerX - 150, 500, 300, 60, 'Join Room →', {
      bgColor: '#1565c0',
      hovered: this.inputHandler.isMouseOverRegion({ x: centerX - 150, y: 500, width: 300, height: 60 })
    })
    this.inputHandler.registerRegion('joinRoom', { x: centerX - 150, y: 500, width: 300, height: 60 },
      () => this.connectAndJoin())

    // Instructions
    r.drawCenteredText('Create a room and share the code with friends', centerX, 600, {
      font: '14px Arial', color: '#666'
    })
    r.drawCenteredText('Or enter a code to join an existing room', centerX, 625, {
      font: '14px Arial', color: '#666'
    })
  }

  _renderConnecting() {
    const r = this.renderer

    r.drawCenteredText('Connecting to server...', r.width / 2, r.height / 2, {
      font: '24px Arial', color: '#4fc3f7'
    })

    // Animated dots
    const dots = '.'.repeat(Math.floor(Date.now() / 500) % 4)
    r.drawCenteredText(dots, r.width / 2, r.height / 2 + 40, {
      font: '24px Arial', color: '#4fc3f7'
    })
  }

  _renderWaitingRoom() {
    const r = this.renderer
    const centerX = r.width / 2

    // Room code display
    r.drawCenteredText('Room Code:', centerX, 130, {
      font: '18px Arial', color: '#aaa'
    })

    // Room code box
    r.drawRect(centerX - 120, 150, 240, 70, '#1a3a1a', 12)
    r.drawRectOutline(centerX - 120, 150, 240, 70, '#4caf50', 3, 12)
    r.drawCenteredText(multiplayer.roomCode || '------', centerX, 190, {
      font: 'bold 36px Arial', color: '#4caf50'
    })

    // Copy button
    const copyBtnX = centerX + 130
    const copyBtnY = 165
    const copyBtnW = 80
    const copyBtnH = 40
    const isCopyHovered = this.inputHandler.isMouseOverRegion({ x: copyBtnX, y: copyBtnY, width: copyBtnW, height: copyBtnH })

    r.drawButton(copyBtnX, copyBtnY, copyBtnW, copyBtnH, '📋 Copy', {
      bgColor: isCopyHovered ? '#4caf50' : '#2e7d32',
      hovered: isCopyHovered
    })
    this.inputHandler.registerRegion('copyCode', { x: copyBtnX, y: copyBtnY, width: copyBtnW, height: copyBtnH },
      () => this.copyRoomCode())

    // Copied feedback message
    if (this.copiedMessage) {
      r.drawCenteredText(this.copiedMessage, centerX, 240, {
        font: 'bold 16px Arial', color: '#4caf50'
      })
    } else {
      r.drawCenteredText('Share this code with friends!', centerX, 240, {
        font: '14px Arial', color: '#888'
      })
    }

    // Players list
    r.drawCenteredText('Players in Room:', centerX, 290, {
      font: 'bold 20px Arial', color: '#fff'
    })

    const listStartY = 320
    this.players.forEach((player, index) => {
      const y = listStartY + index * 50
      const isMe = player.id === multiplayer.playerId
      const isHost = index === 0

      r.drawRect(centerX - 200, y, 400, 45, isMe ? '#1a3a5a' : '#1a1a3a', 8)
      if (isMe) {
        r.drawRectOutline(centerX - 200, y, 400, 45, '#4fc3f7', 2, 8)
      }

      // Player number
      r.drawCircle(centerX - 170, y + 22, 15, isHost ? '#ffd700' : '#555')
      r.drawCenteredText(`${index + 1}`, centerX - 170, y + 22, {
        font: 'bold 14px Arial', color: '#fff', baseline: 'middle'
      })

      // Player name
      r.drawText(`${player.name}${isMe ? ' (You)' : ''}${isHost ? ' 👑' : ''}`, centerX - 140, y + 15, {
        font: '18px Arial', color: '#fff'
      })

      // Ready status
      r.drawText('Ready', centerX + 120, y + 15, {
        font: '14px Arial', color: '#4caf50'
      })
    })

    // Waiting for players or Start button
    const buttonY = listStartY + Math.max(this.players.length, 2) * 50 + 30

    if (multiplayer.isHost) {
      const canStart = this.players.length >= 2

      r.drawButton(centerX - 150, buttonY, 300, 60, canStart ? '▶ Start Game' : 'Waiting for players...', {
        bgColor: canStart ? '#2e7d32' : '#555',
        disabled: !canStart,
        hovered: canStart && this.inputHandler.isMouseOverRegion({ x: centerX - 150, y: buttonY, width: 300, height: 60 })
      })

      if (canStart) {
        this.inputHandler.registerRegion('startGame', { x: centerX - 150, y: buttonY, width: 300, height: 60 },
          () => this.startGame())
      }
    } else {
      r.drawCenteredText('Waiting for host to start...', centerX, buttonY + 30, {
        font: '18px Arial', color: '#888'
      })
    }

    // Leave button
    r.drawButton(centerX - 75, buttonY + 80, 150, 40, 'Leave Room', {
      bgColor: '#c62828',
      hovered: this.inputHandler.isMouseOverRegion({ x: centerX - 75, y: buttonY + 80, width: 150, height: 40 })
    })
    this.inputHandler.registerRegion('leaveRoom', { x: centerX - 75, y: buttonY + 80, width: 150, height: 40 },
      () => this.leaveRoom())
  }

  _setupTextInput() {
    // Keyboard handler for text input
    this._keydownHandler = (e) => {
      if (this.state !== 'menu') return
      if (!this.focusedField) return

      const key = e.key

      // Handle Ctrl+V paste
      if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault()
        navigator.clipboard.readText().then(text => {
          if (this.focusedField === 'name') {
            this.playerName = (this.playerName + text).slice(0, 20)
          } else if (this.focusedField === 'code') {
            // Clean and uppercase the pasted code
            const cleanCode = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
            this.roomCodeInput = (this.roomCodeInput + cleanCode).slice(0, 6)
          }
        }).catch(() => {
          // Clipboard access denied - ignore
        })
        return
      }

      // Handle backspace
      if (key === 'Backspace') {
        e.preventDefault()
        if (this.focusedField === 'name') {
          this.playerName = this.playerName.slice(0, -1)
        } else if (this.focusedField === 'code') {
          this.roomCodeInput = this.roomCodeInput.slice(0, -1)
        }
        return
      }

      // Handle regular character input
      if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        if (this.focusedField === 'name' && this.playerName.length < 20) {
          this.playerName += key
        } else if (this.focusedField === 'code' && this.roomCodeInput.length < 6) {
          this.roomCodeInput += key.toUpperCase()
        }
      }

      // Handle Enter to submit
      if (key === 'Enter') {
        if (this.focusedField === 'code' && this.roomCodeInput.length > 0) {
          this.connectAndJoin()
        }
      }
    }

    document.addEventListener('keydown', this._keydownHandler)
  }

  _handleTextInput() {
    // This is now handled by click regions in _renderMenu
  }

  cleanup() {
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler)
    }
    super.cleanup()
  }
}
