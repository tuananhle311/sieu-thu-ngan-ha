/**
 * Game Scene
 * Main gameplay scene with grid-based layout
 */

import { BaseScene } from './BaseScene.js'
import { PHASES } from '../../game/GameState.js'
import { multiplayer } from '../../network/MultiplayerManager.js'

// Grid Layout Configuration (1280x720 canvas)
const LAYOUT = {
  // Header row
  header: { x: 0, y: 0, w: 1280, h: 50 },

  // Main area (y: 50 to 580)
  board: { x: 0, y: 50, w: 1280, h: 530 },      // Full width - Caves grid + Beasts

  // Bottom row (single unified bar)
  bottomBar: { x: 0, y: 580, w: 1280, h: 140 },

  // Middle column: 5 cave cards in 1 row
  caveGrid: {
    cols: 5,
    rows: 1,
    cardW: 150,
    cardH: 200,
    gapX: 20,
    offsetY: 110   // From board.y (shifted up)
  },

  // Side columns: 2 boss cards stacked per side (left col + right col)
  beastCardW: 160,
  beastCardH: 230,
  beastGapY: 20,
  beastSideMargin: 30,
  beastOffsetY: 30,

  // Player panel settings
  playerPanel: { w: 320, h: 130, gap: 10 }
}

export class GameScene extends BaseScene {
  init(data) {
    super.init(data)

    // Store layout reference
    this.layout = LAYOUT

    // Multiplayer mode
    this.isMultiplayer = data.multiplayer === true
    this.myPlayerId = data.myPlayerId || 1
    this.myPlayerIndex = this.myPlayerId - 1

    // Validate player index
    const initSummary = this.gameEngine.getGameSummary()
    if (this.myPlayerIndex >= initSummary.players?.length) {
      this.myPlayerIndex = 0
    }

    // UI State
    this.hoveredCave = null
    this.hoveredCard = null
    this.hoveredBeast = null
    this.selectedCard = null
    this.selectedMonsters = []

    // Overlays
    this.showingCombat = false
    this.combatResult = null
    this.showingEvent = false
    this.showingCards = false
    this.showingMonsters = false
    this.showingBeastCapture = false
    this.showingSkillPrompt = false
    this.showingPlayers = false
    this.showingHelp = false
    this.showingDayEvent = false

    // Skill prompt data
    this.skillPromptData = null

    // Turn indicator state
    this.showingTurnBanner = false
    this.turnBannerTimer = 0
    this.turnBannerDuration = 1500 // Show "Your Turn" for 1.5 seconds
    this.lastPlayerIndex = -1

    // Subscribe to game events
    this.gameEngine.on('onCombat', (combat) => this.onCombat(combat))
    this.gameEngine.on('onEvent', (event) => this.onEvent(event))
    this.gameEngine.on('onGameOver', (winner) => this.onGameOver(winner))
    this.gameEngine.on('onPhaseChange', (phase) => this.onPhaseChange(phase))
    this.gameEngine.on('onSkillUsed', (player, result) => this.onSkillUsed(player, result))
    this.gameEngine.on('onCardPlayed', (player, result) => this.onCardPlayed(player, result))
    this.gameEngine.on('onTurnChange', (playerIndex) => this.onTurnChange(playerIndex))

    // Setup multiplayer callbacks
    if (this.isMultiplayer) {
      this._setupMultiplayerCallbacks()
    }

    this._setupButtons()

    // Check if game is already in EVENT phase (callbacks may have been missed during init)
    const summary = this.gameEngine.getGameSummary()
    if (summary.currentPhase === PHASES.EVENT && summary.currentEvent) {
      console.log('[GameScene] Game started in EVENT phase, showing event overlay')
      this.showingEvent = true
    }
  }

  /**
   * Check if it's currently my turn (in multiplayer mode)
   */
  isMyTurn() {
    if (!this.isMultiplayer) return true // In offline mode, always allow
    const summary = this.gameEngine.getGameSummary()
    const result = summary.currentPlayerIndex === this.myPlayerIndex
    return result
  }

  /**
   * Setup multiplayer event callbacks
   */
  _setupMultiplayerCallbacks() {
    // Receive game actions from other players
    multiplayer.on('onGameAction', (playerId, action, actionData) => {
      // Ignore actions from myself (I already executed them locally)
      if (playerId === this.myPlayerId) {
        console.log(`[MP] Ignoring my own action: ${action}`)
        return
      }

      console.log(`[MP] Received action from player ${playerId}: ${action}`, actionData)

      switch (action) {
        case 'enter_cave':
          this.gameEngine.enterCave(actionData.caveIndex)
          break
        case 'pass_turn':
          this.gameEngine.passTurn()
          break
        case 'roll_player_dice':
          this.gameEngine.rollPlayerDice()
          break
        case 'roll_monster_dice':
          this.gameEngine.rollMonsterDice()
          const combat = this.gameEngine.getGameSummary().combat
          if (combat && combat.playerDice !== null && combat.monsterDice !== null) {
            this.combatResult = this.gameEngine.resolveCombat()
          }
          break
        case 'combat_continue':
          this.showingCombat = false
          this.combatResult = null
          this.gameEngine.endCombat()
          this.gameEngine.endTurn()
          break
        case 'use_skill':
          this.gameEngine.useSkill(actionData.params)
          break
        case 'play_card':
          this.gameEngine.playTreasureCard(actionData.cardIndex)
          break
        case 'capture_beast':
          this.gameEngine.captureAncientBeast(actionData.beastIndex, actionData.monsterIndices)
          this.gameEngine.endTurn()
          break
        case 'event_continue':
          this.showingEvent = false
          this.gameEngine.executeEventEffect()
          this.gameEngine.completeEventPhase()
          break
      }
    })

    // Sync game state from host
    multiplayer.on('onStateSync', (gameState) => {
      console.log('[MP] Received state sync', gameState)
      if (gameState.showingCombat !== undefined) {
        this.showingCombat = gameState.showingCombat
      }
      if (gameState.showingEvent !== undefined) {
        this.showingEvent = gameState.showingEvent
      }
      if (gameState.combatResult !== undefined) {
        this.combatResult = gameState.combatResult
      }
    })
  }

  /**
   * Send game action to other players in multiplayer mode
   */
  sendMultiplayerAction(action, data = {}) {
    if (!this.isMultiplayer) return
    multiplayer.sendAction(action, data)
  }

  _setupButtons() {
    // Main action buttons
    this.registerButton('pass', { x: 1100, y: 620, width: 150, height: 40 },
      () => this.onPassClick())

    this.registerButton('showCards', { x: 1100, y: 560, width: 150, height: 40 },
      () => this.toggleCardPanel())

    this.registerButton('showMonsters', { x: 1100, y: 500, width: 150, height: 40 },
      () => this.toggleMonsterPanel())

    this.registerButton('useSkill', { x: 940, y: 620, width: 150, height: 40 },
      () => this.onSkillClick())
  }

  // Event handlers
  onCombat(combat) {
    this.showingCombat = true
    this.combatResult = null
  }

  onEvent(event) {
    console.log('[GameScene] Event triggered:', event)
    this.showingEvent = true
  }

  onGameOver(winner) {
    this.changeScene('gameOver', { winner })
  }

  onPhaseChange(phase) {
    this.showingCombat = false
    this.combatResult = null
    this.closeAllPanels()
  }

  onSkillUsed(player, result) {
    // Show skill result notification
    this.showingSkillPrompt = false
  }

  onCardPlayed(player, result) {
    this.selectedCard = null
    this.showingCards = false
  }

  onTurnChange(playerIndex) {
    const summary = this.gameEngine.getGameSummary()
    const player = summary.players[playerIndex]

    // In multiplayer, show banner only when it's the local player's turn
    if (this.isMultiplayer) {
      if (playerIndex === this.myPlayerIndex) {
        this.showingTurnBanner = true
        this.turnBannerTimer = 0
        this.turnBannerPlayer = player.name
      }
    } else {
      // Offline mode - show banner for all human players
      if (player && !player.isAI) {
        this.showingTurnBanner = true
        this.turnBannerTimer = 0
        this.turnBannerPlayer = player.name
      }
    }

    this.lastPlayerIndex = playerIndex
  }

  // UI Actions
  onCaveClick(caveIndex) {
    const summary = this.gameEngine.getGameSummary()
    if (summary.currentPhase !== PHASES.PLAYER_TURNS) return
    if (this.showingCombat || this.showingEvent) return
    if (summary.players[summary.currentPlayerIndex].isAI) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    this.closeAllPanels()
    this.gameEngine.enterCave(caveIndex)

    // Broadcast action to other players
    this.sendMultiplayerAction('enter_cave', { caveIndex })
  }

  onPassClick() {
    const summary = this.gameEngine.getGameSummary()
    if (summary.currentPhase !== PHASES.PLAYER_TURNS) return
    if (this.showingCombat || this.showingEvent) return
    if (summary.players[summary.currentPlayerIndex].isAI) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    this.closeAllPanels()
    this.gameEngine.passTurn()

    // Broadcast action to other players
    this.sendMultiplayerAction('pass_turn', {})
  }

  onSkillClick() {
    const summary = this.gameEngine.getGameSummary()
    if (summary.players[summary.currentPlayerIndex].isAI) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    const canUse = this.gameEngine.canUseSkill()
    if (!canUse.canUse) return

    const skillInfo = this.gameEngine.getSkillInfo()
    const skillId = skillInfo.id

    // Some skills need additional input
    if (skillId === 2) { // Taurus - choose dice value
      this.showSkillPrompt('choose_dice', { min: 1, max: 6 })
    } else if (skillId === 8) { // Scorpio - choose 2 dice numbers
      this.showSkillPrompt('choose_two_dice', {})
    } else if (skillId === 10) { // Capricorn - choose card to discard
      this.showSkillPrompt('choose_card_discard', {})
    } else if (skillId === 12) { // Pisces - predict element
      this.showSkillPrompt('choose_element', {})
    } else {
      this.gameEngine.useSkill()
      this.sendMultiplayerAction('use_skill', { params: {} })
    }
  }

  showSkillPrompt(type, data) {
    this.showingSkillPrompt = true
    this.skillPromptData = { type, data }
  }

  onSkillPromptSelect(value) {
    const type = this.skillPromptData?.type
    let params = {}

    switch (type) {
      case 'choose_dice':
        params.targetDiceValue = value
        break
      case 'choose_two_dice':
        params.chosenDiceNumbers = value
        break
      case 'choose_card_discard':
        params.discardCardIndex = value
        break
      case 'choose_element':
        params.predictedElement = value
        break
    }

    this.showingSkillPrompt = false
    this.gameEngine.useSkill(params)
    this.sendMultiplayerAction('use_skill', { params })
  }

  toggleCardPanel() {
    this.showingCards = !this.showingCards
    if (this.showingCards) {
      this.showingMonsters = false
      this.showingBeastCapture = false
    }
  }

  toggleMonsterPanel() {
    this.showingMonsters = !this.showingMonsters
    if (this.showingMonsters) {
      this.showingCards = false
      this.showingBeastCapture = false
    }
  }

  closeAllPanels() {
    this.showingCards = false
    this.showingMonsters = false
    this.showingBeastCapture = false
    this.showingSkillPrompt = false
    this.selectedCard = null
    this.selectedMonsters = []
  }

  onCardClick(cardIndex) {
    const summary = this.gameEngine.getGameSummary()
    const player = summary.players[summary.currentPlayerIndex]
    const card = player.treasureCards[cardIndex]

    if (!card) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    if (this.gameEngine.canPlayCard(card)) {
      this.gameEngine.playTreasureCard(cardIndex)
      this.sendMultiplayerAction('play_card', { cardIndex })
    }
  }

  onBeastClick(beastIndex) {
    const summary = this.gameEngine.getGameSummary()
    if (summary.currentPhase !== PHASES.PLAYER_TURNS) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    if (this.gameEngine.canCaptureAncientBeast(beastIndex)) {
      this.showingBeastCapture = true
      this.selectedBeastIndex = beastIndex
      this.selectedMonsters = []
    }
  }

  onMonsterSelectForCapture(monsterIndex) {
    const idx = this.selectedMonsters.indexOf(monsterIndex)
    if (idx >= 0) {
      this.selectedMonsters.splice(idx, 1)
    } else if (this.selectedMonsters.length < 3) {
      this.selectedMonsters.push(monsterIndex)
    }
  }

  onConfirmBeastCapture() {
    if (this.selectedMonsters.length === 3) {
      this.gameEngine.captureAncientBeast(this.selectedBeastIndex, this.selectedMonsters)
      this.showingBeastCapture = false

      // Broadcast action to other players
      this.sendMultiplayerAction('capture_beast', {
        beastIndex: this.selectedBeastIndex,
        monsterIndices: this.selectedMonsters
      })

      this.selectedMonsters = []
      this.gameEngine.endTurn()
    }
  }

  onRollPlayerDice() {
    if (!this.showingCombat) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    this.gameEngine.rollPlayerDice()
    this.sendMultiplayerAction('roll_player_dice', {})
  }

  onRollMonsterDice() {
    if (!this.showingCombat) return

    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    this.gameEngine.rollMonsterDice()
    this.sendMultiplayerAction('roll_monster_dice', {})

    const combat = this.gameEngine.getGameSummary().combat
    if (combat && combat.playerDice !== null && combat.monsterDice !== null) {
      this.combatResult = this.gameEngine.resolveCombat()
    }
  }

  onCombatContinue() {
    // In multiplayer, check if it's my turn
    if (this.isMultiplayer && !this.isMyTurn()) return

    this.showingCombat = false
    this.combatResult = null
    this.gameEngine.endCombat()
    this.gameEngine.endTurn()

    this.sendMultiplayerAction('combat_continue', {})
  }

  onEventContinue() {
    if (!this.showingEvent) return

    // In multiplayer, only host (player 1) handles events
    if (this.isMultiplayer && this.myPlayerIndex !== 0) {
      console.log('[GameScene] Only host can continue event')
      return
    }

    this.showingEvent = false
    this.gameEngine.executeEventEffect()
    this.gameEngine.completeEventPhase()

    this.sendMultiplayerAction('event_continue', {})
  }

  update(deltaTime) {
    super.update(deltaTime)

    const mousePos = this.inputHandler.getMousePosition()
    this.hoveredCave = null
    this.hoveredCard = null
    this.hoveredBeast = null

    const summary = this.gameEngine.getGameSummary()

    // Update turn banner timer
    if (this.showingTurnBanner) {
      this.turnBannerTimer += deltaTime
      if (this.turnBannerTimer >= this.turnBannerDuration) {
        this.showingTurnBanner = false
      }
    }

    // Check for turn change (backup detection if event not fired)
    if (summary.currentPhase === PHASES.PLAYER_TURNS) {
      if (this.lastPlayerIndex !== summary.currentPlayerIndex) {
        this.onTurnChange(summary.currentPlayerIndex)
      }
    }

    // Check cave hover - allow hover for visual feedback during player turns
    // (hover is just visual, doesn't require turn check)
    const canHover = summary.currentPhase === PHASES.PLAYER_TURNS &&
                     !this.showingCombat &&
                     !this.hasOverlay()

    if (canHover) {
      summary.caves.forEach((cave, index) => {
        const pos = this._getCavePosition(index)
        if (
          mousePos.x >= pos.x &&
          mousePos.x <= pos.x + pos.width &&
          mousePos.y >= pos.y &&
          mousePos.y <= pos.y + pos.height
        ) {
          this.hoveredCave = index
        }
      })
    }
  }

  hasOverlay() {
    return this.showingCards || this.showingMonsters || this.showingBeastCapture || this.showingSkillPrompt || this.showingCombat || this.showingEvent || this.showingPlayers || this.showingHelp || this.showingDayEvent
  }

  _getCavePosition(index) {
    const L = this.layout
    const grid = L.caveGrid
    const col = index % grid.cols
    const row = Math.floor(index / grid.cols)

    const totalW = grid.cols * grid.cardW + (grid.cols - 1) * grid.gapX
    const startX = L.board.x + (L.board.w - totalW) / 2
    const x = startX + col * (grid.cardW + grid.gapX)
    const y = L.board.y + grid.offsetY + row * (grid.cardH + (grid.gapY || 20))

    return {
      x,
      y,
      centerX: x + grid.cardW / 2,
      centerY: y + grid.cardH / 2,
      width: grid.cardW,
      height: grid.cardH,
      size: grid.cardH,
      radius: Math.min(grid.cardW, grid.cardH) / 2
    }
  }

  _getBeastPosition(index) {
    const L = this.layout
    // 2x2 layout: 0=left-top, 1=right-top, 2=left-bottom, 3=right-bottom
    const isRight = index % 2 === 1
    const isBottom = index >= 2
    const x = isRight
      ? L.board.x + L.board.w - L.beastCardW - L.beastSideMargin
      : L.board.x + L.beastSideMargin
    const y = L.board.y + L.beastOffsetY +
      (isBottom ? L.beastCardH + L.beastGapY : 0)
    return { x, y, width: L.beastCardW, height: L.beastCardH, size: L.beastCardH }
  }

  _getPlayerPanelPosition(index) {
    const L = this.layout
    const panel = L.playerPanel
    const x = L.players.x + 10
    const y = L.players.y + 10 + index * (panel.h + panel.gap)
    return { x, y, w: panel.w, h: panel.h }
  }

  render() {
    const r = this.renderer
    const summary = this.gameEngine.getGameSummary()
    const L = this.layout

    // Clear all input regions at start of each frame to prevent stale callbacks
    this.inputHandler.clearRegions()

    // Draw grid backgrounds for visual clarity
    this._renderGridBackground()

    // Header row
    this._renderHeader(summary)

    // Main area - Beasts on board
    this._renderBeasts(summary)

    // Main area - Caves
    this._renderBoard(summary)

    // Bottom unified bar (left monster box, center fanned cards, right skip)
    this._renderBottomBar(summary)

    // Overlays (on top of everything)
    if (this.showingHelp) this._renderHelpPopup()
    if (this.showingDayEvent) this._renderDayEventPopup(summary)
    if (this.showingPlayers) this._renderPlayersPopup(summary)
    if (this.showingCards) this._renderCardPanel(summary)
    if (this.showingMonsters) this._renderMonsterPanel(summary)
    if (this.showingBeastCapture) this._renderBeastCapturePanel(summary)
    if (this.showingSkillPrompt) this._renderSkillPrompt(summary)
    if (this.showingCombat) this._renderCombatOverlay(summary)
    if (this.showingEvent) this._renderEventOverlay(summary)

    // Debug overlay states
    if (summary.currentPhase === PHASES.EVENT && !this.showingEvent) {
      r.drawText(`[DEBUG] Phase is EVENT but showingEvent=${this.showingEvent}`, 10, 700, {
        font: '14px Arial', color: '#ff0'
      })
    }

    // Turn banner (highest priority overlay)
    if (this.showingTurnBanner) this._renderTurnBanner(summary)
  }

  _renderTurnBanner(summary) {
    const r = this.renderer
    const player = summary.players[summary.currentPlayerIndex]
    if (!player || player.isAI) return

    // Calculate fade effect based on timer
    const progress = this.turnBannerTimer / this.turnBannerDuration
    const alpha = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3)

    // Semi-transparent overlay
    r.drawRect(0, 0, r.width, r.height, `rgba(0,0,0,${0.5 * alpha})`)

    // Banner box
    const bannerW = 500
    const bannerH = 120
    const bannerX = (r.width - bannerW) / 2
    const bannerY = (r.height - bannerH) / 2 - 50

    // Animated scale effect
    const scale = 1 + (1 - progress) * 0.1

    r.ctx.save()
    r.ctx.globalAlpha = alpha
    r.ctx.translate(r.width / 2, bannerY + bannerH / 2)
    r.ctx.scale(scale, scale)
    r.ctx.translate(-r.width / 2, -(bannerY + bannerH / 2))

    // Banner background
    r.drawRect(bannerX, bannerY, bannerW, bannerH, '#1a5a1a', 12)
    r.drawRectOutline(bannerX, bannerY, bannerW, bannerH, '#4caf50', 4, 12)

    // "YOUR TURN" text
    r.drawCenteredText('🎮 LƯỢT CỦA BẠN!', r.width / 2, bannerY + 40, {
      font: 'bold 36px Arial', color: '#4caf50'
    })

    // Player name
    r.drawCenteredText(player.name, r.width / 2, bannerY + 80, {
      font: '24px Arial', color: '#ffffff'
    })

    // Instruction
    r.drawCenteredText('Chọn hang động để tấn công', r.width / 2, bannerY + 105, {
      font: '16px Arial', color: '#aaa'
    })

    r.ctx.restore()
  }

  _renderGridBackground() {
    const r = this.renderer
    const L = this.layout

    // Header strip (semi-transparent over galaxy)
    r.drawRect(L.header.x, L.header.y, L.header.w, L.header.h, 'rgba(10,10,25,0.65)', 0)
  }

  _renderHeader(summary) {
    const r = this.renderer
    const L = this.layout

    // Day counter (clickable - shows current day's event)
    const dayLabel = `Ngày ${summary.currentDay}/${summary.maxDays}`
    r.drawText(dayLabel, L.header.x + 20, L.header.y + 18, {
      font: 'bold 24px Arial',
      color: r.colors.gold,
    })
    const dayRegion = { x: L.header.x + 16, y: L.header.y + 12, width: 130, height: 32 }
    this.inputHandler.registerRegion('showDayEvent', dayRegion,
      () => { this.showingDayEvent = !this.showingDayEvent })

    // Help [?] button next to day counter
    const helpBtn = { x: L.header.x + 150, y: L.header.y + 12, width: 28, height: 28 }
    const helpHovered = this.inputHandler.isMouseOverRegion(helpBtn)
    r.drawCircle(helpBtn.x + 14, helpBtn.y + 14, 14, helpHovered ? r.colors.accent : r.colors.secondary)
    r.drawCircleOutline(helpBtn.x + 14, helpBtn.y + 14, 14, r.colors.gold, 2)
    r.drawCenteredText('?', helpBtn.x + 14, helpBtn.y + 15, {
      font: 'bold 18px Arial', color: r.colors.text, baseline: 'middle'
    })
    this.inputHandler.registerRegion('toggleHelp', helpBtn,
      () => { this.showingHelp = !this.showingHelp })

    // Phase name
    const phaseNames = {
      [PHASES.DAILY_REWARD]: 'Phát Thưởng',
      [PHASES.EVENT]: 'Sự Kiện',
      [PHASES.DAY_END]: 'Kết Thúc Ngày',
    }
    if (phaseNames[summary.currentPhase]) {
      r.drawText(phaseNames[summary.currentPhase], L.header.x + 200, L.header.y + 18, {
        font: '18px Arial',
        color: r.colors.text,
      })
    }

    // Current player info (centered)
    if (summary.currentPhase === PHASES.PLAYER_TURNS) {
      const currentPlayer = summary.players[summary.currentPlayerIndex]
      const aiText = currentPlayer.isAI ? ' 🤖' : ''

      // In multiplayer, show if it's my turn or not
      if (this.isMultiplayer) {
        const isMyTurnNow = this.isMyTurn()
        const turnColor = isMyTurnNow ? '#4caf50' : '#ff9800'
        const turnText = isMyTurnNow ? '🎮 LƯỢT CỦA BẠN' : `⏳ Chờ ${currentPlayer.name}`
        r.drawCenteredText(turnText, L.header.w / 2, L.header.y + 18, {
          font: 'bold 18px Arial',
          color: turnColor,
        })
      } else {
        r.drawCenteredText(`▶ ${currentPlayer.name}${aiText}`, L.header.w / 2, L.header.y + 18, {
          font: 'bold 20px Arial',
          color: r.colors.primary,
        })
      }
    }

    // Resources summary (right side) - show MY resources in multiplayer
    const displayPlayerIndex = this.isMultiplayer ? this.myPlayerIndex : summary.currentPlayerIndex
    const displayPlayer = summary.players[displayPlayerIndex]
    if (displayPlayer) {
      r.drawText(`🍗${displayPlayer.chickenLegs}  ⭐${displayPlayer.victoryPoints}  ⚔️+${displayPlayer.permanentPower}`,
        L.header.w - 320, L.header.y + 18, {
          font: '16px Arial', color: r.colors.text
        })
    }

    // "Người Chơi" button at right end of header
    const playersBtnX = L.header.w - 120
    const playersBtnY = L.header.y + 8
    const playersBtnW = 110
    const playersBtnH = 38
    const playersBtnRegion = { x: playersBtnX, y: playersBtnY, width: playersBtnW, height: playersBtnH }
    const isPlayersHovered = this.inputHandler.isMouseOverRegion(playersBtnRegion)
    r.drawButton(playersBtnX, playersBtnY, playersBtnW, playersBtnH, '👥 Người Chơi', {
      bgColor: this.showingPlayers ? r.colors.primary : r.colors.accent,
      hovered: isPlayersHovered
    })
    this.inputHandler.registerRegion('togglePlayers', playersBtnRegion,
      () => { this.showingPlayers = !this.showingPlayers })
  }

  _renderBeasts(summary) {
    const r = this.renderer

    summary.ancientBeasts.forEach((beast, index) => {
      if (index >= 4) return
      const pos = this._getBeastPosition(index)
      const canCapture = this.gameEngine.canCaptureAncientBeast(index)

      r.drawBeastCard(pos.x, pos.y, pos.width, pos.height, beast, { canCapture })

      if (canCapture && summary.currentPhase === PHASES.PLAYER_TURNS) {
        this.inputHandler.registerRegion(`beast_${index}`,
          { x: pos.x, y: pos.y, width: pos.width, height: pos.height },
          () => this.onBeastClick(index))
      }
    })
  }

  _renderBoard(summary) {
    const r = this.renderer
    const L = this.layout

    // Board title
    r.drawCenteredText('Hang Động', L.board.x + L.board.w / 2, L.board.y + 25, {
      font: 'bold 18px Arial', color: r.colors.text
    })

    // Draw caves in grid
    summary.caves.forEach((cave, index) => {
      const pos = this._getCavePosition(index)
      const isHovered = this.hoveredCave === index
      const isSelectable = summary.currentPhase === PHASES.PLAYER_TURNS &&
                          !summary.players[summary.currentPlayerIndex].isAI &&
                          this.isMyTurn()

      // Use drawCave from renderer
      r.drawCave(pos.x, pos.y, pos.width, pos.height, cave, { hovered: isHovered, selectable: isSelectable })

      // Click region
      if (isSelectable && !this.hasOverlay()) {
        this.inputHandler.registerRegion(`cave_${index}`,
          { x: pos.x, y: pos.y, width: pos.width, height: pos.height },
          () => this.onCaveClick(index))
      }
    })

  }

  _renderPlayerPanels(summary) {
    const r = this.renderer
    const L = this.layout

    // Section title
    r.drawCenteredText('Người Chơi', L.players.x + L.players.w / 2, L.players.y + 15, {
      font: 'bold 14px Arial', color: r.colors.gold
    })

    summary.players.forEach((player, index) => {
      const pos = this._getPlayerPanelPosition(index)
      pos.y += 20 // Offset for title
      const isCurrent = index === summary.currentPlayerIndex
      const isMyPlayer = this.isMultiplayer && index === this.myPlayerIndex

      // Panel background - highlight both current turn and local player in multiplayer
      let bgColor = r.colors.secondary
      if (isCurrent) {
        bgColor = r.colors.accent
      } else if (isMyPlayer) {
        bgColor = '#2a4a2a' // Slightly green tint for local player
      }

      r.drawRect(pos.x, pos.y, pos.w, pos.h, bgColor, 8)

      // Border - gold for current player, green for local player in multiplayer
      if (isCurrent) {
        r.drawRectOutline(pos.x, pos.y, pos.w, pos.h, r.colors.gold, 2, 8)
      } else if (isMyPlayer) {
        r.drawRectOutline(pos.x, pos.y, pos.w, pos.h, '#4caf50', 2, 8)
      }

      // Player number indicator
      const circleColor = isCurrent ? r.colors.primary : (isMyPlayer ? '#4caf50' : '#555')
      r.drawCircle(pos.x + 20, pos.y + 25, 12, circleColor)
      r.drawCenteredText(`${index + 1}`, pos.x + 20, pos.y + 25, {
        font: 'bold 14px Arial', color: '#fff', baseline: 'middle'
      })

      // Name and tags
      const aiTag = player.isAI ? ' 🤖' : ''
      const youTag = isMyPlayer ? ' (Bạn)' : ''
      r.drawText(`${player.name}${aiTag}${youTag}`, pos.x + 40, pos.y + 15, {
        font: 'bold 14px Arial', color: isMyPlayer ? '#4caf50' : r.colors.text
      })

      // Character name
      if (player.character) {
        r.drawText(player.character.name, pos.x + 40, pos.y + 32, {
          font: '12px Arial', color: '#aaa'
        })
      }

      // Resources row 1
      r.drawText(`🍗 ${player.chickenLegs}`, pos.x + 10, pos.y + 55, { font: '14px Arial' })
      r.drawText(`⭐ ${player.victoryPoints}`, pos.x + 70, pos.y + 55, { font: '14px Arial' })
      r.drawText(`⚔️ +${player.permanentPower}`, pos.x + 130, pos.y + 55, { font: '14px Arial' })

      // Resources row 2
      r.drawText(`📜 ${player.treasureCards?.length || 0}`, pos.x + 10, pos.y + 75, { font: '14px Arial' })
      r.drawText(`👾 ${player.capturedMonsters?.length || 0}`, pos.x + 70, pos.y + 75, { font: '14px Arial' })

      // Skill status
      if (player.character) {
        const skillColor = player.skillUsed ? '#666' : r.colors.gold
        const skillText = player.skillUsed ? '⚡ Đã dùng' : '⚡ Sẵn sàng'
        r.drawText(skillText, pos.x + 130, pos.y + 75, {
          font: '12px Arial', color: skillColor
        })
      }

      // Ancient beasts badge
      if (player.ancientBeastCount > 0) {
        r.drawRect(pos.x + pos.w - 35, pos.y + 5, 30, 25, r.colors.gold, 4)
        r.drawCenteredText(`🏆${player.ancientBeastCount}`, pos.x + pos.w - 20, pos.y + 17, {
          font: 'bold 12px Arial', color: '#000'
        })
      }

      // Turn indicator arrow
      if (isCurrent) {
        r.drawText('▶', pos.x - 15, pos.y + pos.h / 2 - 8, {
          font: 'bold 16px Arial', color: r.colors.gold
        })
      }
    })
  }

  _renderPlayersPopup(summary) {
    const r = this.renderer

    // Overlay background
    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.5)')

    // Panel
    const panelW = 750
    const playerCount = summary.players.length
    const panelH = Math.min(60 + playerCount * 100, 560)
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.accent, 2, 12)

    r.drawCenteredText('Người Chơi', r.width / 2, panelY + 25, {
      font: 'bold 22px Arial', color: r.colors.text
    })

    // Close button
    r.drawButton(panelX + panelW - 80, panelY + 10, 70, 36, 'Đóng', {
      bgColor: r.colors.primary
    })
    this.inputHandler.registerRegion('closePlayersPopup',
      { x: panelX + panelW - 80, y: panelY + 10, width: 70, height: 36 },
      () => { this.showingPlayers = false })

    // Render player cards in rows
    const cardW = panelW - 60
    const cardH = 80
    const startX = panelX + 30
    const startY = panelY + 50

    summary.players.forEach((player, index) => {
      const y = startY + index * (cardH + 10)
      if (y + cardH > panelY + panelH - 10) return

      const isCurrent = index === summary.currentPlayerIndex
      const isMyPlayer = this.isMultiplayer && index === this.myPlayerIndex

      // Card background
      let bgColor = '#1a2a4a'
      if (isCurrent) bgColor = r.colors.accent
      else if (isMyPlayer) bgColor = '#2a4a2a'
      r.drawRect(startX, y, cardW, cardH, bgColor, 8)

      // Border
      if (isCurrent) {
        r.drawRectOutline(startX, y, cardW, cardH, r.colors.gold, 2, 8)
      } else if (isMyPlayer) {
        r.drawRectOutline(startX, y, cardW, cardH, '#4caf50', 2, 8)
      }

      // Player number circle
      const circleColor = isCurrent ? r.colors.primary : (isMyPlayer ? '#4caf50' : '#555')
      r.drawCircle(startX + 25, y + 25, 14, circleColor)
      r.drawCenteredText(`${index + 1}`, startX + 25, y + 25, {
        font: 'bold 14px Arial', color: '#fff', baseline: 'middle'
      })

      // Turn indicator
      if (isCurrent) {
        r.drawText('▶', startX + 5, y + 50, {
          font: 'bold 14px Arial', color: r.colors.gold
        })
      }

      // Name and tags
      const aiTag = player.isAI ? ' 🤖' : ''
      const youTag = isMyPlayer ? ' (Bạn)' : ''
      r.drawText(`${player.name}${aiTag}${youTag}`, startX + 50, y + 15, {
        font: 'bold 16px Arial', color: isMyPlayer ? '#4caf50' : r.colors.text
      })

      // Character name
      if (player.character) {
        r.drawText(player.character.name, startX + 50, y + 35, {
          font: '14px Arial', color: '#aaa'
        })
      }

      // Resources - displayed horizontally
      const resY = y + 58
      r.drawText(`🍗 ${player.chickenLegs}`, startX + 50, resY, { font: '14px Arial', color: r.colors.text })
      r.drawText(`⭐ ${player.victoryPoints}`, startX + 130, resY, { font: '14px Arial', color: r.colors.text })
      r.drawText(`⚔️ +${player.permanentPower}`, startX + 210, resY, { font: '14px Arial', color: r.colors.text })
      r.drawText(`📜 ${player.treasureCards?.length || 0}`, startX + 310, resY, { font: '14px Arial', color: r.colors.text })
      r.drawText(`👾 ${player.capturedMonsters?.length || 0}`, startX + 380, resY, { font: '14px Arial', color: r.colors.text })

      // Skill status
      if (player.character) {
        const skillColor = player.skillUsed ? '#666' : r.colors.gold
        const skillText = player.skillUsed ? '⚡ Đã dùng' : '⚡ Sẵn sàng'
        r.drawText(skillText, startX + 460, resY, { font: '14px Arial', color: skillColor })
      }

      // Ancient beasts badge
      if (player.ancientBeastCount > 0) {
        r.drawRect(startX + cardW - 45, y + 10, 35, 25, r.colors.gold, 4)
        r.drawCenteredText(`🏆${player.ancientBeastCount}`, startX + cardW - 28, y + 22, {
          font: 'bold 14px Arial', color: '#000'
        })
      }
    })
  }

  _renderDayEventPopup(summary) {
    const r = this.renderer
    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.6)')

    const panelW = 520
    const panelH = 280
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.gold, 2, 12)

    r.drawCenteredText(`Sự Kiện Ngày ${summary.currentDay}`, r.width / 2, panelY + 30, {
      font: 'bold 22px Arial', color: r.colors.gold
    })

    const event = summary.currentEvent
    if (event) {
      r.drawCenteredText(event.name || 'Sự kiện', r.width / 2, panelY + 80, {
        font: 'bold 18px Arial', color: r.colors.text
      })
      r.drawWrappedText(
        event.description || '',
        r.width / 2,
        panelY + 150,
        panelW - 60,
        {
          font: '15px Arial',
          color: '#ddd',
          align: 'center',
          baseline: 'middle',
          maxLines: 5,
          lineHeight: 22,
        }
      )
    } else {
      r.drawCenteredText('Hôm nay không có sự kiện', r.width / 2, panelY + 130, {
        font: '16px Arial', color: '#aaa'
      })
    }

    const btnW = 90, btnH = 36
    const btnX = panelX + panelW - btnW - 12
    const btnY = panelY + 12
    const btnRegion = { x: btnX, y: btnY, width: btnW, height: btnH }
    r.drawButton(btnX, btnY, btnW, btnH, 'Đóng', {
      bgColor: r.colors.primary,
      hovered: this.inputHandler.isMouseOverRegion(btnRegion)
    })
    this.inputHandler.registerRegion('closeDayEvent', btnRegion,
      () => { this.showingDayEvent = false })
  }

  _renderHelpPopup() {
    const r = this.renderer
    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.6)')

    const panelW = 480
    const panelH = 320
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.gold, 2, 12)

    r.drawCenteredText('Chú Thích Biểu Tượng', r.width / 2, panelY + 30, {
      font: 'bold 22px Arial', color: r.colors.gold
    })

    const items = [
      { icon: '⚔️', label: 'Sức mạnh vĩnh viễn (+ chiến đấu)' },
      { icon: '📜', label: 'Thẻ bảo bối' },
      { icon: '🍗', label: 'Đùi gà (dùng để vào hang)' },
      { icon: '⭐', label: 'Điểm chiến công' },
    ]
    const startY = panelY + 80
    const rowH = 44
    items.forEach((it, i) => {
      const y = startY + i * rowH
      r.drawText(it.icon, panelX + 40, y, { font: '28px Arial', baseline: 'middle' })
      r.drawText(it.label, panelX + 90, y, {
        font: '16px Arial', color: r.colors.text, baseline: 'middle'
      })
    })

    // Close button
    const btnW = 90, btnH = 36
    const btnX = panelX + panelW - btnW - 12
    const btnY = panelY + 12
    const btnRegion = { x: btnX, y: btnY, width: btnW, height: btnH }
    r.drawButton(btnX, btnY, btnW, btnH, 'Đóng', {
      bgColor: r.colors.primary,
      hovered: this.inputHandler.isMouseOverRegion(btnRegion)
    })
    this.inputHandler.registerRegion('closeHelp', btnRegion,
      () => { this.showingHelp = false })
  }

  _renderBottomBar(summary) {
    const r = this.renderer
    const L = this.layout
    const bar = L.bottomBar

    const displayPlayerIndex = this.isMultiplayer ? this.myPlayerIndex : summary.currentPlayerIndex
    const player = summary.players[displayPlayerIndex]
    if (!player) return

    const isMyTurnNow = this.isMyTurn()
    const isHuman = !player.isAI
    const canAct =
      summary.currentPhase === PHASES.PLAYER_TURNS &&
      !this.showingCombat &&
      !this.showingEvent &&
      (this.isMultiplayer ? isMyTurnNow : isHuman)

    // ─── LEFT: Monster box (transparent, icon only) ───
    const boxSize = 110
    const boxX = bar.x + 15
    const boxY = bar.y + (bar.h - boxSize) / 2
    const monsterCount = player.capturedMonsters?.length || 0
    const boxRegion = { x: boxX, y: boxY, width: boxSize, height: boxSize }
    const boxHovered = this.inputHandler.isMouseOverRegion(boxRegion)

    const iconScale = boxHovered ? 1.15 : 1
    r.ctx.save()
    r.ctx.translate(boxX + boxSize / 2, boxY + boxSize / 2 - 8)
    r.ctx.scale(iconScale, iconScale)
    r.drawCenteredText('👾', 0, 0, { font: '52px Arial', baseline: 'middle' })
    r.ctx.restore()
    r.drawCenteredText(`${monsterCount} Thú`, boxX + boxSize / 2, boxY + boxSize - 8, {
      font: 'bold 14px Arial', color: r.colors.text, baseline: 'bottom'
    })
    this.inputHandler.registerRegion('showMonsters', boxRegion, () =>
      this.toggleMonsterPanel()
    )

    // Reward summary next to monster box (element counts → rewards)
    const captured = player.capturedMonsters || []
    const counts = { fire: 0, water: 0, earth: 0, air: 0 }
    captured.forEach((m) => {
      if (counts[m.element] !== undefined) counts[m.element]++
    })
    const rewardRows = [
      { elem: '🔥', reward: '⚔️', n: counts.fire },
      { elem: '💧', reward: '📜', n: counts.water },
      { elem: '🌍', reward: '🍗', n: counts.earth },
      { elem: '💨', reward: '⭐', n: counts.air },
    ]
    const rewardX = boxX + boxSize + 12
    const rewardRowH = 22
    const rewardStartY = boxY + (boxSize - rewardRowH * rewardRows.length) / 2
    rewardRows.forEach((row, i) => {
      const ry = rewardStartY + i * rewardRowH + rewardRowH / 2
      r.drawText(row.elem, rewardX, ry, {
        font: '16px Arial', baseline: 'middle'
      })
      r.drawText('→', rewardX + 26, ry, {
        font: '14px Arial', color: '#888', baseline: 'middle'
      })
      r.drawText(row.reward, rewardX + 46, ry, {
        font: '16px Arial', baseline: 'middle'
      })
      r.drawText(`×${row.n}`, rewardX + 72, ry, {
        font: 'bold 14px Arial',
        color: row.n > 0 ? r.colors.gold : '#555',
        baseline: 'middle',
      })
    })

    // ─── RIGHT: Skip turn (transparent label, no button bg) ───
    const btnW = 150
    const btnH = 64
    const btnX = bar.x + bar.w - btnW - 15
    const btnY = bar.y + (bar.h - btnH) / 2
    const btnRegion = { x: btnX, y: btnY, width: btnW, height: btnH }
    const btnHovered = canAct && this.inputHandler.isMouseOverRegion(btnRegion)
    const labelColor = !canAct ? '#666' : (btnHovered ? r.colors.gold : r.colors.text)
    r.drawCenteredText('⏭️ Bỏ Lượt', btnX + btnW / 2, btnY + btnH / 2, {
      font: 'bold 22px Arial', color: labelColor, baseline: 'middle'
    })
    if (canAct) {
      this.inputHandler.registerRegion('pass', btnRegion, () => this.onPassClick())
    }

    // Status text under skip button if waiting / AI
    if (this.isMultiplayer && !isMyTurnNow) {
      const cur = summary.players[summary.currentPlayerIndex]
      r.drawCenteredText(`Chờ ${cur?.name || ''}…`, btnX + btnW / 2, btnY + btnH + 14, {
        font: '12px Arial', color: '#ff9800'
      })
    } else if (!isHuman && !this.isMultiplayer) {
      r.drawCenteredText('AI đang suy nghĩ…', btnX + btnW / 2, btnY + btnH + 14, {
        font: '12px Arial', color: '#888'
      })
    }

    // ─── CENTER: Fanned cards (skill + treasure cards) ───
    if (summary.currentPhase !== PHASES.PLAYER_TURNS) return

    const skillInfo = this.gameEngine.getSkillInfo()
    const skillCheck = this.gameEngine.canUseSkill()
    const cards = []
    if (skillInfo) {
      cards.push({
        kind: 'skill',
        name: skillInfo.name,
        description: skillInfo.description,
        canPlay: canAct && skillCheck.canUse,
      })
    }
    ;(player.treasureCards || []).forEach((c, i) => {
      cards.push({
        kind: 'treasure',
        name: c.name,
        description: c.description,
        type: c.type,
        canPlay: canAct && this.gameEngine.canPlayCard(c),
        treasureIndex: i,
      })
    })
    if (cards.length === 0) return

    const cardW = 140
    const cardH = 180
    const fanCenterX = bar.x + bar.w / 2
    const fanCenterY = bar.y + bar.h + 140
    const fanRadius = 320
    const N = cards.length
    const totalArc = Math.min(1.05, 0.18 * N)
    const startAngle = -totalArc / 2
    const step = N > 1 ? totalArc / (N - 1) : 0

    // Precompute layout
    const layouts = cards.map((card, index) => {
      const angle = N === 1 ? 0 : startAngle + index * step
      return {
        card,
        index,
        angle,
        cx: fanCenterX + Math.sin(angle) * fanRadius,
        cy: fanCenterY - Math.cos(angle) * fanRadius,
      }
    })

    // Find hovered card (iterate from last to first so overlapping front cards win)
    const mouse = this.inputHandler.getMousePosition?.() || this.inputHandler.mousePos
    let hoveredIdx = -1
    if (mouse) {
      for (let i = layouts.length - 1; i >= 0; i--) {
        const l = layouts[i]
        if (
          mouse.x >= l.cx - cardW / 2 &&
          mouse.x <= l.cx + cardW / 2 &&
          mouse.y >= l.cy - cardH / 2 &&
          mouse.y <= l.cy + cardH / 2
        ) {
          hoveredIdx = i
          break
        }
      }
    }

    const drawOne = (l, scale = 1, lifted = false) => {
      const ctx = r.ctx
      const card = l.card
      const isSkill = card.kind === 'skill'

      ctx.save()
      // Lift hovered card upward a bit and clear its rotation
      const drawCY = lifted ? l.cy - 30 : l.cy
      ctx.translate(l.cx, drawCY)
      ctx.rotate(lifted ? 0 : l.angle)
      ctx.scale(scale, scale)

      const x = -cardW / 2
      const y = -cardH / 2
      const borderColor = isSkill
        ? r.colors.gold
        : card.type === 'instant' ? '#44cc44' : '#ff4444'
      const bg = card.canPlay
        ? (isSkill ? r.colors.accent : '#3a5a8a')
        : '#2a2a3a'

      r.drawRect(x, y, cardW, cardH, bg, 10)
      r.drawRectOutline(x, y, cardW, cardH, borderColor, lifted ? 3 : 2, 10)

      const icon = isSkill ? '✨' : (card.type === 'instant' ? '⚡' : '🎯')
      r.drawCenteredText(icon, 0, y + 26, { font: '28px Arial' })

      r.drawWrappedText(card.name, 0, y + 70, cardW - 16, {
        font: 'bold 14px Arial',
        color: r.colors.text,
        align: 'center',
        baseline: 'middle',
        maxLines: 2,
        lineHeight: 17,
      })

      if (card.description) {
        r.drawWrappedText(card.description, 0, y + 130, cardW - 16, {
          font: '12px Arial',
          color: '#ddd',
          align: 'center',
          baseline: 'middle',
          maxLines: 3,
          lineHeight: 15,
        })
      }

      if (!card.canPlay) {
        r.drawRect(x, y, cardW, cardH, 'rgba(0,0,0,0.45)', 10)
      }

      ctx.restore()
    }

    // Draw non-hovered first, hovered last (on top, scaled 1.5)
    layouts.forEach((l, i) => {
      if (i !== hoveredIdx) drawOne(l, 1, false)
    })
    if (hoveredIdx !== -1) {
      drawOne(layouts[hoveredIdx], 1.5, true)
    }

    // Register click regions (hovered uses its enlarged bounds for accurate hit-test)
    layouts.forEach((l, i) => {
      const card = l.card
      const isSkill = card.kind === 'skill'
      const scale = i === hoveredIdx ? 1.5 : 1
      const lift = i === hoveredIdx ? 30 : 0
      const w = cardW * scale
      const h = cardH * scale
      const region = {
        x: l.cx - w / 2,
        y: l.cy - lift - h / 2,
        width: w,
        height: h,
      }
      if (card.canPlay && !this.hasOverlay()) {
        const id = isSkill ? 'useSkill' : `handCard_${card.treasureIndex}`
        this.inputHandler.registerRegion(id, region, () => {
          if (isSkill) this.onSkillClick()
          else this.onCardClick(card.treasureIndex)
        })
      }
    })
  }

  _renderCardPanel(summary) {
    const r = this.renderer
    // In multiplayer, show MY cards
    const displayPlayerIndex = this.isMultiplayer ? this.myPlayerIndex : summary.currentPlayerIndex
    const player = summary.players[displayPlayerIndex]
    const cards = player.treasureCards || []

    // Overlay background
    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.5)')

    // Panel
    const panelW = 800
    const panelH = 520
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.accent, 2, 12)

    r.drawCenteredText('Thẻ Bảo Bối', r.width / 2, panelY + 25, {
      font: 'bold 24px Arial', color: r.colors.text
    })

    // Cards grid
    const cardW = 160
    const cardH = 200
    const cols = 4
    const startX = panelX + 40
    const startY = panelY + 60

    cards.forEach((card, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = startX + col * (cardW + 15)
      const y = startY + row * (cardH + 12)

      if (y + cardH > panelY + panelH - 50) return // Don't render if overflow

      const canPlay = this.gameEngine.canPlayCard(card)
      const typeColor = card.type === 'instant' ? '#44cc44' : '#ff4444'

      r.drawRect(x, y, cardW, cardH, canPlay ? r.colors.accent : '#333', 8)
      r.drawRectOutline(x, y, cardW, cardH, typeColor, 2, 8)

      // Full card name
      r.drawCenteredText(card.name, x + cardW/2, y + 18, {
        font: 'bold 14px Arial', color: r.colors.text
      })

      // Type label
      const typeIcon = card.type === 'instant' ? '⚡' : '🎯'
      const typeLabel = card.type === 'instant' ? 'Tức thì' : 'Hành động'
      r.drawCenteredText(`${typeIcon} ${typeLabel}`, x + cardW/2, y + 38, {
        font: '12px Arial', color: typeColor
      })

      // Full description with word wrap
      const desc = card.description || ''
      const maxLineLen = 22
      const words = desc.split(' ')
      const lines = []
      let currentLine = ''
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxLineLen) {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = (currentLine + ' ' + word).trim()
        }
      }
      if (currentLine) lines.push(currentLine)

      lines.slice(0, 6).forEach((line, i) => {
        r.drawCenteredText(line, x + cardW/2, y + 58 + i * 18, {
          font: '12px Arial', color: '#ccc'
        })
      })

      if (canPlay) {
        r.drawCenteredText('▶ Click để dùng', x + cardW/2, y + cardH - 18, {
          font: 'bold 12px Arial', color: r.colors.gold
        })

        this.inputHandler.registerRegion(`card_${index}`,
          { x, y, width: cardW, height: cardH },
          () => this.onCardClick(index))
      }
    })

    // Close button
    r.drawButton(panelX + panelW - 80, panelY + 10, 70, 36, 'Đóng', {
      bgColor: r.colors.primary
    })
    this.inputHandler.registerRegion('closeCards',
      { x: panelX + panelW - 80, y: panelY + 10, width: 70, height: 36 },
      () => this.showingCards = false)
  }

  _renderMonsterPanel(summary) {
    const r = this.renderer
    // In multiplayer, show MY monsters
    const displayPlayerIndex = this.isMultiplayer ? this.myPlayerIndex : summary.currentPlayerIndex
    const player = summary.players[displayPlayerIndex]
    const monsters = player.capturedMonsters || []

    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.5)')

    const panelW = 700
    const panelH = 350
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)

    r.drawCenteredText('Quái Thú Đã Bắt', r.width / 2, panelY + 25, {
      font: 'bold 24px Arial', color: r.colors.text
    })

    // Element counts
    const elements = { fire: 0, water: 0, earth: 0, air: 0 }
    monsters.forEach(m => elements[m.element]++)

    r.drawText(`🔥${elements.fire}  💧${elements.water}  🌍${elements.earth}  💨${elements.air}`,
      panelX + 30, panelY + 55, { font: '16px Arial' })

    // Monster list
    const cols = 6
    const cardW = 78
    const cardH = 104
    const startX = panelX + 30
    const startY = panelY + 85

    monsters.forEach((monster, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = startX + col * (cardW + 10)
      const y = startY + row * (cardH + 10)

      if (y + cardH > panelY + panelH - 50) return

      r.drawMonsterCard(x, y, cardW, cardH, monster)
    })

    if (monsters.length === 0) {
      r.drawCenteredText('Chưa có quái thú nào', r.width / 2, panelY + 150, {
        font: '16px Arial', color: '#888'
      })
    }

    r.drawButton(panelX + panelW - 80, panelY + 10, 70, 36, 'Đóng', { bgColor: r.colors.primary })
    this.inputHandler.registerRegion('closeMonsters',
      { x: panelX + panelW - 80, y: panelY + 10, width: 70, height: 36 },
      () => this.showingMonsters = false)
  }

  _renderBeastCapturePanel(summary) {
    const r = this.renderer
    // In multiplayer, use my monsters for capture
    const displayPlayerIndex = this.isMultiplayer ? this.myPlayerIndex : summary.currentPlayerIndex
    const player = summary.players[displayPlayerIndex]
    const monsters = player.capturedMonsters || []
    const req = this.gameEngine.getCaptureRequirements(this.selectedBeastIndex)

    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.7)')

    const panelW = 700
    const panelH = 450
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)

    r.drawCenteredText(`Thu Phục: ${req.beast.name}`, r.width / 2, panelY + 30, {
      font: 'bold 24px Arial', color: r.colors.gold
    })

    r.drawCenteredText(`Yêu cầu: 2 ${req.requiredElement} + 1 bất kỳ`, r.width / 2, panelY + 60, {
      font: '16px Arial', color: r.colors.text
    })

    r.drawCenteredText(`Chọn 3 quái thú (đã chọn: ${this.selectedMonsters.length}/3)`, r.width / 2, panelY + 85, {
      font: '14px Arial', color: '#aaa'
    })

    // Monster selection
    const cols = 6
    const cardW = 78
    const cardH = 104
    const startX = panelX + 30
    const startY = panelY + 110

    monsters.forEach((monster, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = startX + col * (cardW + 10)
      const y = startY + row * (cardH + 10)

      if (y + cardH > panelY + panelH - 80) return

      const isSelected = this.selectedMonsters.includes(index)
      r.drawMonsterCard(x, y, cardW, cardH, monster, { selected: isSelected })

      this.inputHandler.registerRegion(`selectMonster_${index}`,
        { x, y, width: cardW, height: cardH },
        () => this.onMonsterSelectForCapture(index))
    })

    // Confirm button
    const canConfirm = this.selectedMonsters.length === 3
    r.drawButton(panelX + panelW/2 - 100, panelY + panelH - 60, 100, 40, 'Xác Nhận', {
      bgColor: canConfirm ? r.colors.primary : '#444',
      disabled: !canConfirm
    })
    if (canConfirm) {
      this.inputHandler.registerRegion('confirmCapture',
        { x: panelX + panelW/2 - 100, y: panelY + panelH - 60, width: 100, height: 40 },
        () => this.onConfirmBeastCapture())
    }

    r.drawButton(panelX + panelW/2 + 10, panelY + panelH - 60, 90, 40, 'Hủy', { bgColor: r.colors.secondary })
    this.inputHandler.registerRegion('cancelCapture',
      { x: panelX + panelW/2 + 10, y: panelY + panelH - 60, width: 90, height: 40 },
      () => { this.showingBeastCapture = false; this.selectedMonsters = [] })
  }

  _renderSkillPrompt(summary) {
    const r = this.renderer
    const type = this.skillPromptData?.type

    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.7)')

    const panelW = 400
    const panelH = 250
    const panelX = (r.width - panelW) / 2
    const panelY = (r.height - panelH) / 2

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 12)

    if (type === 'choose_dice') {
      r.drawCenteredText('Chọn số xúc xắc (1-6)', r.width/2, panelY + 30, {
        font: 'bold 20px Arial', color: r.colors.text
      })

      for (let i = 1; i <= 6; i++) {
        const bx = panelX + 40 + (i-1) * 55
        const by = panelY + 80
        r.drawButton(bx, by, 45, 45, i.toString(), { bgColor: r.colors.accent })
        this.inputHandler.registerRegion(`dice_${i}`, { x: bx, y: by, width: 45, height: 45 },
          () => this.onSkillPromptSelect(i))
      }
    } else if (type === 'choose_element') {
      r.drawCenteredText('Dự đoán hệ quái thú', r.width/2, panelY + 30, {
        font: 'bold 20px Arial', color: r.colors.text
      })

      const elements = ['fire', 'water', 'earth', 'air']
      const names = ['🔥 Lửa', '💧 Nước', '🌍 Đất', '💨 Khí']
      elements.forEach((elem, i) => {
        const bx = panelX + 30 + i * 90
        const by = panelY + 80
        r.drawButton(bx, by, 80, 50, names[i], { bgColor: r.colors[elem] || r.colors.accent })
        this.inputHandler.registerRegion(`elem_${elem}`, { x: bx, y: by, width: 80, height: 50 },
          () => this.onSkillPromptSelect(elem))
      })
    }

    r.drawButton(panelX + panelW/2 - 40, panelY + panelH - 50, 80, 40, 'Hủy', { bgColor: r.colors.primary })
    this.inputHandler.registerRegion('cancelSkill',
      { x: panelX + panelW/2 - 40, y: panelY + panelH - 50, width: 80, height: 40 },
      () => this.showingSkillPrompt = false)
  }

  _renderCombatOverlay(summary) {
    const r = this.renderer
    const combat = summary.combat

    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.7)')

    const panelX = 290
    const panelY = 150
    const panelW = 700
    const panelH = 420

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 16)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.primary, 3, 16)

    r.drawCenteredText('⚔️ CHIẾN ĐẤU! ⚔️', r.width/2, panelY + 40, {
      font: 'bold 32px Arial', color: r.colors.primary
    })

    if (combat) {
      // Player side
      r.drawText('Người chơi', panelX + 80, panelY + 90, { font: 'bold 18px Arial' })

      const playerDiceVal = combat.playerDiceModified ?? combat.playerDice
      r.drawDice(panelX + 80, panelY + 120, 70, playerDiceVal, { rolling: playerDiceVal === null })

      if (combat.player) {
        r.drawText(`+${combat.player.permanentPower || 0} power`, panelX + 80, panelY + 210, {
          font: '14px Arial', color: '#aaa'
        })
      }

      // Monster side
      r.drawText('Quái thú', panelX + panelW - 180, panelY + 90, { font: 'bold 18px Arial' })
      r.drawDice(panelX + panelW - 180, panelY + 120, 70, combat.monsterDice, { rolling: combat.monsterDice === null })

      if (combat.monster) {
        r.drawText(combat.monster.name, panelX + panelW - 180, panelY + 210, { font: '14px Arial' })
        r.drawText(`+${combat.monster.power} power`, panelX + panelW - 180, panelY + 230, {
          font: '14px Arial', color: r.colors[combat.monster.element]
        })
      }

      // VS
      r.drawCenteredText('VS', r.width/2, panelY + 160, {
        font: 'bold 36px Arial', color: r.colors.gold
      })

      // Roll buttons
      if (combat.playerDice === null) {
        const btnX = panelX + 60
        const btnY = panelY + 260
        r.drawButton(btnX, btnY, 130, 40, 'Tung Xúc Xắc', { bgColor: r.colors.primary })
        this.inputHandler.registerRegion('rollPlayer',
          { x: btnX, y: btnY, width: 130, height: 40 },
          () => this.onRollPlayerDice())
      }

      if (combat.playerDice !== null && combat.monsterDice === null) {
        r.drawButton(panelX + panelW - 190, panelY + 260, 130, 40, 'Quái Vật Tung', { bgColor: r.colors.primary })
        this.inputHandler.registerRegion('rollMonster',
          { x: panelX + panelW - 190, y: panelY + 260, width: 130, height: 40 },
          () => this.onRollMonsterDice())
      }

      // Result
      if (this.combatResult) {
        const res = this.combatResult
        const resultText = res.playerWins ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!'
        const resultColor = res.playerWins ? r.colors.gold : '#ff4444'

        r.drawCenteredText(resultText, r.width/2, panelY + 290, {
          font: 'bold 28px Arial', color: resultColor
        })

        r.drawCenteredText(`${res.playerPower} vs ${res.monsterPower}`, r.width/2, panelY + 325, {
          font: '18px Arial', color: r.colors.text
        })

        if (res.playerWins && res.rewards) {
          r.drawCenteredText(`+${res.rewards.victoryPoints}⭐ +1👾`, r.width/2, panelY + 350, {
            font: '16px Arial', color: r.colors.gold
          })
        }

        r.drawButton(r.width/2 - 70, panelY + 375, 140, 40, 'Tiếp Tục', { bgColor: r.colors.primary })
        this.inputHandler.registerRegion('combatContinue',
          { x: r.width/2 - 70, y: panelY + 375, width: 140, height: 40 },
          () => this.onCombatContinue())
      }
    }
  }

  _renderEventOverlay(summary) {
    const r = this.renderer
    const event = summary.currentEvent

    r.drawRect(0, 0, r.width, r.height, 'rgba(0,0,0,0.7)')

    const panelX = 340
    const panelY = 180
    const panelW = 600
    const panelH = 360

    r.drawRect(panelX, panelY, panelW, panelH, r.colors.secondary, 16)
    r.drawRectOutline(panelX, panelY, panelW, panelH, r.colors.accent, 3, 16)

    r.drawCenteredText('📜 SỰ KIỆN 📜', r.width/2, panelY + 40, {
      font: 'bold 28px Arial', color: r.colors.accent
    })

    if (event) {
      r.drawCenteredText(event.name, r.width/2, panelY + 90, {
        font: 'bold 22px Arial', color: r.colors.text
      })

      const typeColors = { reward: r.colors.gold, penalty: '#ff4444', neutral: '#888' }
      const typeNames = { reward: '🎁 Phần Thưởng', penalty: '⚠️ Phạt', neutral: '⚖️ Trung Lập' }
      r.drawCenteredText(typeNames[event.type] || event.type, r.width/2, panelY + 120, {
        font: '14px Arial', color: typeColors[event.type]
      })

      // Word wrap description
      const words = event.description.split(' ')
      let line = ''
      let lineY = panelY + 160

      for (const word of words) {
        if ((line + word).length > 45) {
          r.drawCenteredText(line.trim(), r.width/2, lineY, { font: '16px Arial', color: '#ccc' })
          line = word + ' '
          lineY += 25
        } else {
          line += word + ' '
        }
      }
      if (line.trim()) {
        r.drawCenteredText(line.trim(), r.width/2, lineY, { font: '16px Arial', color: '#ccc' })
      }
    }

    r.drawButton(r.width/2 - 70, panelY + panelH - 60, 140, 45, 'Tiếp Tục', { bgColor: r.colors.primary })
    this.inputHandler.registerRegion('eventContinue',
      { x: r.width/2 - 70, y: panelY + panelH - 60, width: 140, height: 45 },
      () => this.onEventContinue())
  }

  cleanup() {
    super.cleanup()
  }
}
