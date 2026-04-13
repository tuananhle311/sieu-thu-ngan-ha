/**
 * Renderer
 * Handles all canvas rendering operations
 */

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height

    // Colors
    this.colors = {
      background: '#16213e',
      primary: '#e94560',
      secondary: '#0f3460',
      accent: '#533483',
      text: '#ffffff',
      textDark: '#1a1a2e',
      fire: '#ff6b35',
      water: '#4ecdc4',
      earth: '#8b5e34',
      air: '#a8dadc',
      gold: '#ffd700',
      silver: '#c0c0c0',
    }

    // Fonts
    this.fonts = {
      title: 'bold 48px Arial',
      subtitle: 'bold 24px Arial',
      body: '18px Arial',
      small: '14px Arial',
    }
  }

  /**
   * Clear the canvas with the galaxy background (full canvas)
   */
  clear() {
    this.drawGalaxyBackground(0, 0, this.width, this.height)
  }

  /**
   * Draw a galaxy-style background within a rectangle (cached offscreen)
   */
  drawGalaxyBackground(x, y, width, height) {
    const key = `${width}x${height}`
    if (!this._galaxyCache || this._galaxyCache.key !== key) {
      this._galaxyCache = { key, canvas: this._buildGalaxy(width, height) }
    }
    this.ctx.drawImage(this._galaxyCache.canvas, x, y)
  }

  /**
   * @private
   */
  _buildGalaxy(width, height) {
    const off = document.createElement('canvas')
    off.width = width
    off.height = height
    const c = off.getContext('2d')

    // Deep space base
    c.fillStyle = '#05060f'
    c.fillRect(0, 0, width, height)

    // Galaxy core glow
    const cx = width * 0.55
    const cy = height * 0.45
    const grad = c.createRadialGradient(cx, cy, 10, cx, cy, width * 0.7)
    grad.addColorStop(0, 'rgba(120, 80, 200, 0.55)')
    grad.addColorStop(0.25, 'rgba(70, 40, 140, 0.35)')
    grad.addColorStop(0.55, 'rgba(25, 15, 60, 0.25)')
    grad.addColorStop(1, 'rgba(5, 6, 15, 0)')
    c.fillStyle = grad
    c.fillRect(0, 0, width, height)

    // Nebula blobs
    const nebulas = [
      { x: width * 0.15, y: height * 0.25, r: width * 0.22, color: 'rgba(233, 69, 96, 0.18)' },
      { x: width * 0.85, y: height * 0.7, r: width * 0.25, color: 'rgba(78, 205, 196, 0.14)' },
      { x: width * 0.35, y: height * 0.85, r: width * 0.18, color: 'rgba(255, 107, 53, 0.12)' },
      { x: width * 0.75, y: height * 0.15, r: width * 0.17, color: 'rgba(168, 218, 220, 0.12)' },
    ]
    nebulas.forEach((n) => {
      const g = c.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
      g.addColorStop(0, n.color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g
      c.fillRect(0, 0, width, height)
    })

    // Seeded star layout
    let seed = 1337
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const starCount = Math.round((width * height) / 2200)
    for (let i = 0; i < starCount; i++) {
      const sx = rand() * width
      const sy = rand() * height
      const size = rand() * 1.2 + 0.2
      const alpha = rand() * 0.7 + 0.3
      c.fillStyle = `rgba(255,255,255,${alpha})`
      c.fillRect(sx, sy, size, size)
    }

    const glowCount = Math.round(starCount * 0.12)
    for (let i = 0; i < glowCount; i++) {
      const sx = rand() * width
      const sy = rand() * height
      const radius = rand() * 1.8 + 1
      const halo = c.createRadialGradient(sx, sy, 0, sx, sy, radius * 4)
      halo.addColorStop(0, 'rgba(255,255,255,0.9)')
      halo.addColorStop(0.4, 'rgba(200,220,255,0.35)')
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = halo
      c.beginPath()
      c.arc(sx, sy, radius * 4, 0, Math.PI * 2)
      c.fill()
    }

    return off
  }

  /**
   * Draw a rectangle
   */
  drawRect(x, y, width, height, color, radius = 0) {
    this.ctx.fillStyle = color
    if (radius > 0) {
      this.drawRoundedRect(x, y, width, height, radius)
      this.ctx.fill()
    } else {
      this.ctx.fillRect(x, y, width, height)
    }
  }

  /**
   * Draw a rounded rectangle path
   */
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    )
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  /**
   * Draw outlined rectangle
   */
  drawRectOutline(x, y, width, height, color, lineWidth = 2, radius = 0) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    if (radius > 0) {
      this.drawRoundedRect(x, y, width, height, radius)
      this.ctx.stroke()
    } else {
      this.ctx.strokeRect(x, y, width, height)
    }
  }

  /**
   * Draw text
   */
  drawText(text, x, y, options = {}) {
    const {
      font = this.fonts.body,
      color = this.colors.text,
      align = 'left',
      baseline = 'top',
    } = options

    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.fillText(text, x, y)
  }

  /**
   * Draw centered text
   */
  drawCenteredText(text, x, y, options = {}) {
    this.drawText(text, x, y, { ...options, align: 'center' })
  }

  /**
   * Draw text wrapped to a maximum width. Returns total rendered height.
   */
  drawWrappedText(text, x, y, maxWidth, options = {}) {
    const {
      font = this.fonts.body,
      color = this.colors.text,
      align = 'center',
      baseline = 'middle',
      lineHeight = null,
      maxLines = 3,
    } = options

    this.ctx.font = font
    const words = String(text).split(/\s+/)
    const lines = []
    let current = ''

    for (const word of words) {
      const test = current ? current + ' ' + word : word
      if (this.ctx.measureText(test).width <= maxWidth || !current) {
        current = test
      } else {
        lines.push(current)
        current = word
        if (lines.length >= maxLines) break
      }
    }
    if (current && lines.length < maxLines) lines.push(current)

    // Truncate last line with ellipsis if overflow
    if (lines.length === maxLines) {
      let last = lines[maxLines - 1]
      while (
        last.length > 1 &&
        this.ctx.measureText(last + '…').width > maxWidth
      ) {
        last = last.slice(0, -1)
      }
      if (this.ctx.measureText(last).width > maxWidth) {
        lines[maxLines - 1] = last + '…'
      }
    }

    const fontSize = parseInt(font, 10) || 12
    const lh = lineHeight || Math.round(fontSize * 1.15)
    const totalH = lines.length * lh
    const startY =
      baseline === 'middle' ? y - totalH / 2 + lh / 2 : y

    lines.forEach((line, i) => {
      this.drawText(line, x, startY + i * lh, {
        font,
        color,
        align,
        baseline: 'middle',
      })
    })

    return totalH
  }

  /**
   * Draw a circle
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * Draw circle outline
   */
  drawCircleOutline(x, y, radius, color, lineWidth = 2) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.stroke()
  }

  /**
   * Draw a button
   */
  drawButton(x, y, width, height, text, options = {}) {
    const {
      bgColor = this.colors.primary,
      textColor = this.colors.text,
      hovered = false,
      disabled = false,
    } = options

    // Button background
    let color = bgColor
    if (disabled) {
      color = '#666666'
    } else if (hovered) {
      color = this._lightenColor(bgColor, 20)
    }

    this.drawRect(x, y, width, height, color, 8)

    // Button text
    this.drawCenteredText(text, x + width / 2, y + height / 2, {
      font: this.fonts.subtitle,
      color: disabled ? '#999999' : textColor,
      baseline: 'middle',
    })

    return { x, y, width, height }
  }

  /**
   * Draw a card
   */
  drawCard(x, y, width, height, options = {}) {
    const {
      bgColor = this.colors.secondary,
      borderColor = this.colors.accent,
      title = '',
      subtitle = '',
      element = null,
    } = options

    // Card background
    this.drawRect(x, y, width, height, bgColor, 8)
    this.drawRectOutline(x, y, width, height, borderColor, 2, 8)

    // Element indicator
    if (element) {
      const elementColor = this.colors[element] || this.colors.text
      this.drawCircle(x + width - 15, y + 15, 10, elementColor)
    }

    // Title
    if (title) {
      this.drawCenteredText(title, x + width / 2, y + 20, {
        font: this.fonts.body,
        color: this.colors.text,
      })
    }

    // Subtitle
    if (subtitle) {
      this.drawCenteredText(subtitle, x + width / 2, y + 45, {
        font: this.fonts.small,
        color: this.colors.text,
      })
    }

    return { x, y, width, height }
  }

  /**
   * Draw a monster card (3:4 ratio, element-colored background)
   */
  drawMonsterCard(x, y, width, height, monster, options = {}) {
    const { selected = false, radius = 10 } = options
    const elemColors = {
      fire: this.colors.fire,
      water: this.colors.water,
      earth: this.colors.earth,
      air: this.colors.air,
    }
    const elemIcons = { fire: '🔥', water: '💧', earth: '🌍', air: '💨' }
    const rewardIcons = { fire: '⚔️', water: '📜', earth: '🍗', air: '⭐' }

    const bg = elemColors[monster.element] || this.colors.secondary

    this.drawRect(x, y, width, height, bg, radius)
    this.drawRectOutline(
      x,
      y,
      width,
      height,
      selected ? this.colors.gold : this.colors.textDark,
      selected ? 3 : 2,
      radius
    )

    const pad = Math.max(4, Math.round(width * 0.07))
    const iconFont = `${Math.round(width * 0.2)}px Arial`
    const statFont = `bold ${Math.round(width * 0.18)}px Arial`

    // Top-left: element icon
    this.drawText(elemIcons[monster.element] || '', x + pad, y + pad, {
      font: iconFont,
    })

    // Top-right: attack
    this.drawText(`⚔${monster.power}`, x + width - pad, y + pad, {
      font: statFont,
      color: this.colors.text,
      align: 'right',
    })

    // Bottom-left: reward
    this.drawText(
      rewardIcons[monster.element] || '',
      x + pad,
      y + height - pad,
      { font: iconFont, baseline: 'bottom' }
    )

    // Monster name (center, wrapped within card width)
    const nameFontSize = Math.round(width * 0.13)
    this.drawWrappedText(
      monster.name,
      x + width / 2,
      y + height / 2,
      width - pad * 2,
      {
        font: `bold ${nameFontSize}px Arial`,
        color: this.colors.text,
        align: 'center',
        baseline: 'middle',
        maxLines: 2,
        lineHeight: Math.round(nameFontSize * 1.2),
      }
    )

    return { x, y, width, height }
  }

  /**
   * Draw a boss/ancient beast card (same 3:4 style as monster card)
   */
  drawBeastCard(x, y, width, height, beast, options = {}) {
    const { canCapture = false, radius = 10 } = options
    const elemColors = {
      fire: this.colors.fire,
      water: this.colors.water,
      earth: this.colors.earth,
      air: this.colors.air,
    }
    const elemIcons = { fire: '🔥', water: '💧', earth: '🌍', air: '💨' }

    const bg = elemColors[beast.element] || this.colors.secondary

    this.drawRect(x, y, width, height, bg, radius)

    // Decorative double border (gold frame for boss cards)
    this.drawRectOutline(
      x,
      y,
      width,
      height,
      canCapture ? this.colors.gold : '#b8860b',
      canCapture ? 4 : 3,
      radius
    )
    const inset = 5
    this.drawRectOutline(
      x + inset,
      y + inset,
      width - inset * 2,
      height - inset * 2,
      canCapture ? '#fff6c2' : this.colors.gold,
      1,
      Math.max(2, radius - inset)
    )

    // Corner ornaments (small diamonds)
    const drawCornerGem = (cx, cy) => {
      this.ctx.save()
      this.ctx.translate(cx, cy)
      this.ctx.rotate(Math.PI / 4)
      this.ctx.fillStyle = this.colors.gold
      this.ctx.fillRect(-3, -3, 6, 6)
      this.ctx.restore()
    }
    const off = inset + 2
    drawCornerGem(x + off, y + off)
    drawCornerGem(x + width - off, y + off)
    drawCornerGem(x + off, y + height - off)
    drawCornerGem(x + width - off, y + height - off)

    const pad = Math.max(6, Math.round(width * 0.1))
    const iconFont = `${Math.round(width * 0.18)}px Arial`
    const statFont = `bold ${Math.round(width * 0.16)}px Arial`

    // Top-left: element icon
    this.drawText(elemIcons[beast.element] || '', x + pad, y + pad, {
      font: iconFont,
    })

    // Top-right: victory points (reward)
    this.drawText(`${beast.victoryPoints || 3}⭐`, x + width - pad, y + pad, {
      font: statFont,
      color: this.colors.gold,
      align: 'right',
    })

    // Bottom-left: requirement (2{elem}+1)
    const reqText = `2${(elemIcons[beast.element] || '').trim() || beast.element[0].toUpperCase()}+1`
    this.drawText(reqText, x + pad, y + height - pad, {
      font: `${Math.round(width * 0.12)}px Arial`,
      color: this.colors.text,
      baseline: 'bottom',
    })

    // Beast name (center, wrapped within card width)
    const nameFontSize = Math.round(width * 0.11)
    this.drawWrappedText(
      beast.name,
      x + width / 2,
      y + height / 2,
      width - pad * 2,
      {
        font: `bold ${nameFontSize}px Arial`,
        color: this.colors.text,
        align: 'center',
        baseline: 'middle',
        maxLines: 2,
        lineHeight: Math.round(nameFontSize * 1.3),
      }
    )

    return { x, y, width, height }
  }

  /**
   * Draw a player panel
   */
  drawPlayerPanel(x, y, width, height, player, isCurrentPlayer = false) {
    // Panel background
    const bgColor = isCurrentPlayer ? this.colors.accent : this.colors.secondary
    this.drawRect(x, y, width, height, bgColor, 8)

    if (isCurrentPlayer) {
      this.drawRectOutline(x, y, width, height, this.colors.gold, 3, 8)
    }

    // Player name
    this.drawText(player.name, x + 10, y + 10, {
      font: this.fonts.subtitle,
      color: this.colors.text,
    })

    // Character name
    if (player.character) {
      this.drawText(player.character.name, x + 10, y + 40, {
        font: this.fonts.small,
        color: this.colors.text,
      })
    }

    // Resources
    const resourceY = y + 70
    this.drawText(`🍗 ${player.chickenLegs}`, x + 10, resourceY, {
      font: this.fonts.body,
    })
    this.drawText(`⭐ ${player.victoryPoints}`, x + 70, resourceY, {
      font: this.fonts.body,
    })
    this.drawText(`⚔️ +${player.permanentPower}`, x + 130, resourceY, {
      font: this.fonts.body,
    })

    // Cards and monsters count
    const countY = y + 95
    this.drawText(`📜 ${player.treasureCardCount || 0}`, x + 10, countY, {
      font: this.fonts.small,
    })
    this.drawText(`👾 ${player.monsterCount || 0}`, x + 60, countY, {
      font: this.fonts.small,
    })

    return { x, y, width, height }
  }

  /**
   * Draw a cave
   */
  drawCave(x, y, width, height, cave, options = {}) {
    const { hovered = false, selectable = false } = options

    if (cave.monster) {
      this.drawMonsterCard(x, y, width, height, cave.monster, {
        selected: selectable && hovered,
      })
    } else {
      this.drawRect(x, y, width, height, this.colors.secondary, 10)
      if (selectable) {
        this.drawRectOutline(x, y, width, height, this.colors.gold, 2, 10)
      }
    }

    // Cave cost badge (above card, top-left outside)
    this.drawText(`🍗${cave.cost}`, x, y - 6, {
      font: 'bold 22px Arial',
      color: this.colors.text,
      baseline: 'bottom',
    })

    // Victory points badge (below card, bottom-right outside)
    this.drawText(`${cave.victoryPoints}⭐`, x + width, y + height + 6, {
      font: 'bold 22px Arial',
      color: this.colors.gold,
      align: 'right',
      baseline: 'top',
    })

    return {
      x,
      y,
      width,
      height,
      centerX: x + width / 2,
      centerY: y + height / 2,
      radius: Math.min(width, height) / 2,
    }
  }

  /**
   * Draw dice
   */
  drawDice(x, y, size, value, options = {}) {
    const { rolling = false, color = this.colors.text } = options

    // Dice background
    this.drawRect(x, y, size, size, '#ffffff', 8)
    this.drawRectOutline(x, y, size, size, '#333333', 2, 8)

    if (rolling) {
      // Show rolling animation indicator
      this.drawCenteredText('?', x + size / 2, y + size / 2, {
        font: 'bold 32px Arial',
        color: '#333333',
        baseline: 'middle',
      })
    } else if (value !== null) {
      // Show dice value
      this.drawCenteredText(value.toString(), x + size / 2, y + size / 2, {
        font: 'bold 32px Arial',
        color: '#333333',
        baseline: 'middle',
      })
    }

    return { x, y, width: size, height: size }
  }

  /**
   * Lighten a hex color
   * @private
   */
  _lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  /**
   * Draw an image (placeholder for now)
   */
  drawImage(image, x, y, width, height) {
    if (image) {
      this.ctx.drawImage(image, x, y, width, height)
    } else {
      // Placeholder
      this.drawRect(x, y, width, height, '#333', 4)
      this.drawCenteredText('IMG', x + width / 2, y + height / 2, {
        color: '#666',
        baseline: 'middle',
      })
    }
  }

  /**
   * Get canvas context for custom drawing
   */
  getContext() {
    return this.ctx
  }
}
