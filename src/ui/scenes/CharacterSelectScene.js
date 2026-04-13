/**
 * Character Select Scene
 * Supports both offline and multiplayer modes
 */

import { BaseScene } from './BaseScene.js'
import { multiplayer } from '../../network/MultiplayerManager.js'

export class CharacterSelectScene extends BaseScene {
  init(data) {
    super.init(data)

    this.characters = this.gameEngine.getAvailableCharacters()
    this.selectedCharacters = new Map() // playerIndex -> characterId
    this.currentPlayerIndex = 0
    this.playerCount = 2 // Default
    this.playerNames = ['Người chơi 1', 'Người chơi 2']
    this.aiPlayers = new Set() // Set of AI player indices

    // Multiplayer mode
    this.isMultiplayer = data.multiplayer || false
    this.multiplayerPlayers = data.players || []
    this.myPlayerId = data.playerId || 1
    this.isHost = data.isHost || false

    // In multiplayer mode, set up from lobby data
    if (this.isMultiplayer) {
      this.playerCount = this.multiplayerPlayers.length
      this.playerNames = this.multiplayerPlayers.map(p => p.name)
      this.currentPlayerIndex = this.myPlayerId - 1 // Each player selects their own
      this._setupMultiplayerCallbacks()
    }

    // Flag to prevent double scene transitions
    this._hasTransitionedToGame = false

    // Page for character grid (12 characters, show 6 per page)
    this.currentPage = 0
    this.charsPerPage = 6

    this._setupButtons()
  }

  _setupMultiplayerCallbacks() {
    multiplayer.on('onGameAction', (playerId, action, data) => {
      if (action === 'select_character') {
        // Another player selected a character
        this.selectedCharacters.set(data.playerIndex, data.characterId)
      }
    })

    multiplayer.on('onStateSync', (gameState) => {
      // Sync character selections
      if (gameState.characterSelections) {
        this.selectedCharacters = new Map(Object.entries(gameState.characterSelections).map(
          ([k, v]) => [parseInt(k), v]
        ))
      }
    })

    // When host starts game - only non-host players should react
    // (host already handles this in startGame() method)
    multiplayer.on('onGameStarted', (gameState, players) => {
      // Prevent double transitions
      if (this._hasTransitionedToGame) {
        console.log('[CharacterSelect] Already transitioned to game, ignoring')
        return
      }

      if (this.isHost) {
        console.log('[CharacterSelect] Host ignoring onGameStarted callback (already handled)')
        return
      }

      if (gameState.phase === 'playing') {
        console.log('[CharacterSelect] Non-host received game start, initializing...')
        console.log('[CharacterSelect] Synced firstPlayerIndex:', gameState.firstPlayerIndex)
        this._hasTransitionedToGame = true

        // Build player configs from synced data
        const playerConfigs = players.map((p, i) => ({
          name: p.name,
          isAI: false, // All real players in multiplayer
          characterId: this.selectedCharacters.get(i)
        }))

        this.gameEngine.initializeGame(playerConfigs)

        // Override firstPlayerIndex with the synced value from host
        if (gameState.firstPlayerIndex !== undefined) {
          this.gameEngine.gameState.set('firstPlayerIndex', gameState.firstPlayerIndex)
          this.gameEngine.gameState.set('currentPlayerIndex', gameState.firstPlayerIndex)
          console.log('[CharacterSelect] Set currentPlayerIndex to synced value:', gameState.firstPlayerIndex)
        }

        this.gameEngine.startGame()
        this.changeScene('game', { multiplayer: true, myPlayerId: this.myPlayerId })
      }
    })
  }

  _setupButtons() {
    const r = this.renderer

    // Player count buttons
    for (let i = 2; i <= 6; i++) {
      this.registerButton(
        `playerCount_${i}`,
        {
          x: 200 + (i - 2) * 70,
          y: 80,
          width: 60,
          height: 40,
        },
        () => this.setPlayerCount(i)
      )
    }

    // Character cards (6 per page)
    const cardWidth = 180
    const cardHeight = 220
    const gap = 20
    const startX = 100
    const startY = 200

    for (let i = 0; i < this.charsPerPage; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      this.registerButton(
        `char_${i}`,
        {
          x: startX + col * (cardWidth + gap),
          y: startY + row * (cardHeight + gap),
          width: cardWidth,
          height: cardHeight,
        },
        () => this.selectCharacter(i)
      )
    }

    // Navigation buttons
    this.registerButton(
      'prevPage',
      { x: 50, y: 350, width: 40, height: 100 },
      () => this.prevPage()
    )

    this.registerButton(
      'nextPage',
      { x: 690, y: 350, width: 40, height: 100 },
      () => this.nextPage()
    )

    // Start game button
    this.registerButton(
      'startGame',
      { x: r.width - 250, y: r.height - 80, width: 200, height: 50 },
      () => this.startGame()
    )

    // Back button
    this.registerButton(
      'back',
      { x: 50, y: r.height - 80, width: 120, height: 50 },
      () => this.changeScene('mainMenu')
    )
  }

  setPlayerCount(count) {
    this.playerCount = count
    this.playerNames = []
    for (let i = 0; i < count; i++) {
      this.playerNames.push(`Người chơi ${i + 1}`)
    }
    this.selectedCharacters.clear()
    this.currentPlayerIndex = 0
    this.aiPlayers.clear()
  }

  toggleAI(playerIndex) {
    if (this.aiPlayers.has(playerIndex)) {
      this.aiPlayers.delete(playerIndex)
    } else {
      this.aiPlayers.add(playerIndex)
    }
  }

  selectCharacter(cardIndex) {
    const charIndex = this.currentPage * this.charsPerPage + cardIndex
    if (charIndex >= this.characters.length) return

    const character = this.characters[charIndex]

    // Check if character is already selected by another player
    for (const [pIndex, charId] of this.selectedCharacters) {
      if (charId === character.id && pIndex !== this.currentPlayerIndex) {
        return // Character already taken
      }
    }

    // In multiplayer, each player can only select their own character
    if (this.isMultiplayer) {
      const myIndex = this.myPlayerId - 1
      this.selectedCharacters.set(myIndex, character.id)

      // Broadcast selection to other players
      multiplayer.sendAction('select_character', {
        playerIndex: myIndex,
        characterId: character.id
      })

      // Host syncs state
      if (this.isHost) {
        const selections = {}
        this.selectedCharacters.forEach((v, k) => selections[k] = v)
        multiplayer.syncState({ characterSelections: selections })
      }
    } else {
      // Offline mode - select for current player and move to next
      this.selectedCharacters.set(this.currentPlayerIndex, character.id)

      // Move to next player
      if (this.currentPlayerIndex < this.playerCount - 1) {
        this.currentPlayerIndex++
      }
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--
    }
  }

  nextPage() {
    const maxPage = Math.ceil(this.characters.length / this.charsPerPage) - 1
    if (this.currentPage < maxPage) {
      this.currentPage++
    }
  }

  canStartGame() {
    // All players must have selected a character
    return this.selectedCharacters.size === this.playerCount
  }

  startGame() {
    console.log('[CharacterSelect] startGame clicked')
    console.log('[CharacterSelect] canStartGame:', this.canStartGame(),
      '| selectedCharacters:', this.selectedCharacters.size,
      '| playerCount:', this.playerCount)
    console.log('[CharacterSelect] isMultiplayer:', this.isMultiplayer,
      '| isHost:', this.isHost,
      '| _hasTransitionedToGame:', this._hasTransitionedToGame)

    if (!this.canStartGame()) {
      console.log('[CharacterSelect] Cannot start - not all players selected characters')
      return
    }
    if (this._hasTransitionedToGame) {
      console.log('[CharacterSelect] Cannot start - already transitioned')
      return
    }

    if (this.isMultiplayer) {
      // Only host can start in multiplayer
      if (!this.isHost) {
        console.log('[CharacterSelect] Cannot start - not host')
        return
      }

      console.log('[CharacterSelect] Host starting multiplayer game')
      this._hasTransitionedToGame = true

      // Host initializes game first to get firstPlayerIndex
      const playerConfigs = this.multiplayerPlayers.map((p, i) => ({
        name: p.name,
        isAI: false,
        characterId: this.selectedCharacters.get(i)
      }))

      this.gameEngine.initializeGame(playerConfigs)

      // Get the firstPlayerIndex that was determined by dice roll
      const gameSummary = this.gameEngine.getGameSummary()
      const firstPlayerIndex = gameSummary.currentPlayerIndex

      console.log('[CharacterSelect] Host determined firstPlayerIndex:', firstPlayerIndex)

      // Send game started signal with character selections AND firstPlayerIndex
      const selections = {}
      this.selectedCharacters.forEach((v, k) => selections[k] = v)

      multiplayer.startGame({
        phase: 'playing',
        characterSelections: selections,
        firstPlayerIndex: firstPlayerIndex  // Sync this to other players
      })

      this.gameEngine.startGame()
      this.changeScene('game', { multiplayer: true, myPlayerId: this.myPlayerId })
    } else {
      // Offline mode
      const playerConfigs = []
      for (let i = 0; i < this.playerCount; i++) {
        playerConfigs.push({
          name: this.playerNames[i],
          isAI: this.aiPlayers.has(i),
          characterId: this.selectedCharacters.get(i),
        })
      }

      this.gameEngine.initializeGame(playerConfigs)
      this.gameEngine.startGame()
      this.changeScene('game', { multiplayer: false })
    }
  }

  render() {
    const r = this.renderer

    // Title
    r.drawCenteredText('Chọn Nhân Vật', r.width / 2, 30, {
      font: 'bold 36px Arial',
      color: r.colors.text,
    })

    // Player count selector
    r.drawText('Số người chơi:', 100, 90, { font: '18px Arial' })
    for (let i = 2; i <= 6; i++) {
      const isSelected = this.playerCount === i
      r.drawButton(200 + (i - 2) * 70, 80, 60, 40, i.toString(), {
        bgColor: isSelected ? r.colors.primary : r.colors.secondary,
        hovered: false,
      })
    }

    // Current player indicator
    r.drawText(
      `Đang chọn cho: ${this.playerNames[this.currentPlayerIndex] || 'Player'}`,
      100,
      140,
      { font: 'bold 20px Arial', color: r.colors.gold }
    )

    // Character cards
    const cardWidth = 180
    const cardHeight = 220
    const gap = 20
    const startX = 100
    const startY = 200

    for (let i = 0; i < this.charsPerPage; i++) {
      const charIndex = this.currentPage * this.charsPerPage + i
      if (charIndex >= this.characters.length) break

      const char = this.characters[charIndex]
      const row = Math.floor(i / 3)
      const col = i % 3
      const x = startX + col * (cardWidth + gap)
      const y = startY + row * (cardHeight + gap)

      // Check if selected
      let selectedBy = null
      for (const [pIndex, charId] of this.selectedCharacters) {
        if (charId === char.id) {
          selectedBy = pIndex
          break
        }
      }

      // Card background
      let bgColor = r.colors.secondary
      let borderColor = r.colors.accent
      if (selectedBy !== null) {
        borderColor = r.colors.gold
        bgColor = r.colors.accent
      }

      r.drawRect(x, y, cardWidth, cardHeight, bgColor, 8)
      r.drawRectOutline(x, y, cardWidth, cardHeight, borderColor, 2, 8)

      // Character name
      r.drawCenteredText(char.name, x + cardWidth / 2, y + 20, {
        font: 'bold 16px Arial',
        color: r.colors.text,
      })

      // English name
      r.drawCenteredText(char.nameEn, x + cardWidth / 2, y + 45, {
        font: '12px Arial',
        color: '#888888',
      })

      // Skill name
      r.drawCenteredText(char.skillName, x + cardWidth / 2, y + 80, {
        font: 'bold 14px Arial',
        color: r.colors.primary,
      })

      // Timing indicator
      const timingText = char.timing === 'anytime' ? 'Bất cứ lúc nào' : 'Trong lượt'
      r.drawCenteredText(timingText, x + cardWidth / 2, y + 105, {
        font: '11px Arial',
        color: '#aaaaaa',
      })

      // Skill description (truncated)
      const desc = char.skillDescription
      const maxLen = 50
      const truncatedDesc =
        desc.length > maxLen ? desc.substring(0, maxLen) + '...' : desc

      // Wrap text manually
      const words = truncatedDesc.split(' ')
      let line = ''
      let lineY = y + 130
      for (const word of words) {
        const testLine = line + word + ' '
        if (testLine.length > 22) {
          r.drawCenteredText(line, x + cardWidth / 2, lineY, {
            font: '11px Arial',
            color: '#cccccc',
          })
          line = word + ' '
          lineY += 15
          if (lineY > y + 180) break
        } else {
          line = testLine
        }
      }
      if (line && lineY <= y + 180) {
        r.drawCenteredText(line, x + cardWidth / 2, lineY, {
          font: '11px Arial',
          color: '#cccccc',
        })
      }

      // Selected indicator
      if (selectedBy !== null) {
        r.drawCenteredText(
          `P${selectedBy + 1}`,
          x + cardWidth - 20,
          y + cardHeight - 20,
          {
            font: 'bold 14px Arial',
            color: r.colors.gold,
          }
        )
      }
    }

    // Page navigation
    const maxPage = Math.ceil(this.characters.length / this.charsPerPage)
    r.drawCenteredText(`${this.currentPage + 1} / ${maxPage}`, 380, 670, {
      font: '16px Arial',
    })

    if (this.currentPage > 0) {
      r.drawButton(50, 350, 40, 100, '<', { bgColor: r.colors.secondary })
    }
    if (this.currentPage < maxPage - 1) {
      r.drawButton(690, 350, 40, 100, '>', { bgColor: r.colors.secondary })
    }

    // Selected players panel (right side)
    const panelX = 780
    r.drawRect(panelX, 150, 450, 450, r.colors.secondary, 8)
    r.drawText('Người chơi đã chọn:', panelX + 20, 170, {
      font: 'bold 18px Arial',
    })

    for (let i = 0; i < this.playerCount; i++) {
      const y = 210 + i * 70
      const charId = this.selectedCharacters.get(i)
      const char = charId
        ? this.characters.find((c) => c.id === charId)
        : null

      const isCurrentPlayer = i === this.currentPlayerIndex
      const bgColor = isCurrentPlayer ? r.colors.accent : '#2a2a4a'

      r.drawRect(panelX + 10, y, 430, 60, bgColor, 4)

      r.drawText(`P${i + 1}: ${this.playerNames[i]}`, panelX + 20, y + 15, {
        font: 'bold 14px Arial',
        color: isCurrentPlayer ? r.colors.gold : r.colors.text,
      })

      if (char) {
        r.drawText(`${char.name} (${char.nameEn})`, panelX + 20, y + 38, {
          font: '13px Arial',
          color: '#aaaaaa',
        })
      } else {
        r.drawText('Chưa chọn...', panelX + 20, y + 38, {
          font: '13px Arial',
          color: '#666666',
        })
      }

      // AI toggle (simple indicator for now)
      const isAI = this.aiPlayers.has(i)
      r.drawText(isAI ? '🤖 AI' : '👤 Human', panelX + 350, y + 25, {
        font: '12px Arial',
      })
    }

    // Start game button
    const canStart = this.canStartGame()
    r.drawButton(r.width - 250, r.height - 80, 200, 50, 'Bắt Đầu', {
      disabled: !canStart,
      hovered: canStart,
    })

    // Back button
    r.drawButton(50, r.height - 80, 120, 50, 'Quay Lại', {
      bgColor: r.colors.secondary,
    })
  }
}
